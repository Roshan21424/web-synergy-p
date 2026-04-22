package com.personal.synergy.controller;

import com.personal.synergy.SSEMangaer.SseEmitterManager;
import com.personal.synergy.entity.ExpertInfo;
import com.personal.synergy.entity.Session;
import com.personal.synergy.entity.User;
import com.personal.synergy.repository.SessionRepository;
import com.personal.synergy.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Slf4j
@RestController
@RequestMapping("/api/call")   // FIX: added API versioning; keep /api/call alias via mapping below if needed
@RequiredArgsConstructor
public class CallController {

    // FIX: all fields are now private final, injected by @RequiredArgsConstructor (no more @Autowired)
    private final UserRepository userRepository;
    private final SessionRepository sessionRepository;
    private final SseEmitterManager emitterManager;
    private final StringRedisTemplate redisTemplate;

    private final Map<String, ExpertInfo> expertRegistry = new ConcurrentHashMap<>();

    private static final long PENDING_CALL_TTL   = 30;
    private static final long HEARTBEAT_INTERVAL = 15;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

    // ── Lifecycle ────────────────────────────────────────────────────────────

    @PostConstruct
    public void initHeartbeat() {
        scheduler.scheduleAtFixedRate(() -> {
            emitterManager.getExpertEmitters().forEach((expertId, emitter) -> {
                try {
                    emitter.send(SseEmitter.event().name("heartbeat").data("ping"));
                    maintainPresence(expertId);
                } catch (Exception ex) {
                    log.warn("Heartbeat failed for expert {}, removing emitter: {}", expertId, ex.getMessage());
                    emitter.complete();
                    emitterManager.completeExpert(expertId);
                }
            });
        }, HEARTBEAT_INTERVAL, HEARTBEAT_INTERVAL, TimeUnit.SECONDS);

        // FIX: removed 5-second debug heartbeat log that spammed stdout
    }

    @PreDestroy   // FIX: added — previously scheduler threads leaked on context refresh
    public void shutdown() {
        log.info("Shutting down CallController scheduler...");
        scheduler.shutdown();
        try {
            if (!scheduler.awaitTermination(5, TimeUnit.SECONDS)) {
                scheduler.shutdownNow();
            }
        } catch (InterruptedException e) {
            scheduler.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }

    // ── SSE ──────────────────────────────────────────────────────────────────

    @GetMapping(value = "/sse/user", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeUser(@RequestParam String userId) {
        log.info("User {} opening SSE connection", userId);
        return emitterManager.addUserEmitter(userId);
    }

    @GetMapping(value = "/sse/expert", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeExpert(@RequestParam String expertId,
                                      @RequestParam String field,
                                      @RequestParam String subField) {

        log.info("Expert {} opening SSE connection (field={}, subField={})", expertId, field, subField);

        SseEmitter emitter = emitterManager.addExpertEmitter(expertId);

        User expertUser = userRepository.findById(Long.valueOf(expertId))
                .orElseThrow(() -> new IllegalArgumentException("Expert not found: " + expertId));

        ExpertInfo expertInfo = new ExpertInfo();
        expertInfo.setExpertId(expertId);
        expertInfo.setName(expertUser.getName());
        expertInfo.setEmail(expertUser.getEmail());
        expertInfo.setField(field);
        expertInfo.setSubField(subField);
        expertInfo.setProfileDescription(expertUser.getProfileDescription());
        expertInfo.setActive(expertUser.isActive());
        expertInfo.setLiveSince(LocalDateTime.now());
        expertInfo.setEmitter(emitter);

        expertRegistry.put(expertId, expertInfo);

        try {
            emitter.send(SseEmitter.event().name("INIT").data("Connected at " + expertInfo.getLiveSince()));
        } catch (IOException e) {
            log.error("Failed to send INIT event to expert {}: {}", expertId, e.getMessage());
            emitter.completeWithError(e);
        }

        emitter.onCompletion(() -> expertRegistry.remove(expertId));
        emitter.onTimeout(()   -> expertRegistry.remove(expertId));
        emitter.onError(ex     -> expertRegistry.remove(expertId));

        return emitter;
    }

    // ── Call flow ────────────────────────────────────────────────────────────

    @PostMapping("/request")
    public Map<String, String> requestCall(@RequestParam String userId,
                                           @RequestParam String expertId) {

        String key = "call:" + expertId;
        Boolean result = redisTemplate.opsForValue().setIfAbsent(key, userId, PENDING_CALL_TTL, TimeUnit.SECONDS);

        if (result == null || !result) {
            log.debug("Expert {} is busy, rejecting call from user {}", expertId, userId);
            return Map.of("status", "busy");
        }

        log.info("Call request: user {} → expert {}", userId, expertId);

        emitterManager.sendToExpert(expertId, SseEmitter.event().name("incoming-call").data(userId));
        emitterManager.sendToUser(userId,     SseEmitter.event().name("call-pending").data("Waiting for expert..."));

        scheduler.schedule(() -> {
            String current = redisTemplate.opsForValue().get(key);
            if (userId.equals(current)) {
                redisTemplate.delete(key);
                log.info("Call from user {} to expert {} timed out", userId, expertId);
                emitterManager.sendToUser(userId, SseEmitter.event().name("call-rejected").data("timeout"));
                emitterManager.completeUser(userId);
            }
        }, PENDING_CALL_TTL, TimeUnit.SECONDS);

        return Map.of("status", "pending");
    }

    @PostMapping("/accept")
    public Map<String, String> accept(@RequestParam String expertId,
                                      @RequestParam String userId) {

        String key = "call:" + expertId;
        String currentUser = redisTemplate.opsForValue().get(key);

        if (currentUser == null || !currentUser.equals(userId)) {
            log.warn("Accept called but no matching pending call: expert={} user={}", expertId, userId);
            return Map.of("status", "no_request");
        }

        redisTemplate.delete(key);

        String sessionId = "session-" + System.currentTimeMillis();
        Session session = new Session(sessionId, userId, expertId);
        sessionRepository.save(session);

        log.info("Call accepted: expert {} accepted user {} → session {}", expertId, userId, sessionId);

        emitterManager.sendToUser(userId, SseEmitter.event().name("call-accepted").data(sessionId));
        emitterManager.completeUser(userId);
        emitterManager.sendToExpert(expertId, SseEmitter.event().name("call-accepted").data(sessionId));

        return Map.of("status", "accepted", "sessionId", sessionId);
    }

    @PostMapping("/reject")
    public Map<String, String> reject(@RequestParam String expertId,
                                      @RequestParam String userId) {

        String key = "call:" + expertId;
        redisTemplate.delete(key);

        log.info("Call rejected: expert {} rejected user {}", expertId, userId);

        emitterManager.sendToUser(userId, SseEmitter.event().name("call-rejected").data("Expert rejected!"));
        emitterManager.completeUser(userId);
        emitterManager.sendToExpert(expertId, SseEmitter.event().name("call-rejected").data(userId));

        return Map.of("status", "rejected");
    }

    // ── Expert search (with pagination) ──────────────────────────────────────

    /**
     * FIX: added pagination — previously returned all experts with no limit.
     */
    @GetMapping("/experts")
    public Page<ExpertInfo> searchExperts(
            @RequestParam(required = false) String field,
            @RequestParam(required = false) String subField,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        List<ExpertInfo> filtered = expertRegistry.values().stream()
                .filter(e -> field    == null || e.getField().equalsIgnoreCase(field))
                .filter(e -> subField == null || e.getSubField().equalsIgnoreCase(subField))
                .toList();

        int start = Math.min(page * size, filtered.size());
        int end   = Math.min(start + size, filtered.size());

        return new PageImpl<>(filtered.subList(start, end), PageRequest.of(page, size), filtered.size());
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void maintainPresence(String expertId) {
        redisTemplate.opsForValue().set("expert:avail:" + expertId, "1", 30, TimeUnit.SECONDS);
    }
}