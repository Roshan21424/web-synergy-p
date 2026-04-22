package com.personal.synergy.SSEMangaer;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j   // FIX: added — replaces all System.out.println and e.printStackTrace()
@Component
public class SseEmitterManager {

    private final Map<String, SseEmitter> userEmitters   = new ConcurrentHashMap<>();
    private final Map<String, SseEmitter> expertEmitters = new ConcurrentHashMap<>();

    public SseEmitter addUserEmitter(String userId) {
        return addEmitter(userId, userEmitters);
    }

    public SseEmitter addExpertEmitter(String expertId) {
        return addEmitter(expertId, expertEmitters);
    }

    private SseEmitter addEmitter(String id, Map<String, SseEmitter> store) {
        SseEmitter emitter = new SseEmitter(0L);
        store.put(id, emitter);

        Runnable cleanup = () -> store.remove(id);
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        try {
            emitter.send(SseEmitter.event().name("status").data("connected"));
            log.info("SSE emitter registered for id={}", id);   // FIX: was System.out.println
        } catch (Exception e) {
            log.error("Failed to send initial SSE event for id={}: {}", id, e.getMessage(), e);   // FIX: was e.printStackTrace()
        }

        return emitter;
    }

    public void sendToUser(String userId, SseEmitter.SseEventBuilder event) {
        sendEvent(userId, event, userEmitters);
    }

    public void sendToExpert(String expertId, SseEmitter.SseEventBuilder event) {
        sendEvent(expertId, event, expertEmitters);
    }

    private void sendEvent(String id, SseEmitter.SseEventBuilder event, Map<String, SseEmitter> store) {
        SseEmitter emitter = store.get(id);
        if (emitter != null) {
            try {
                emitter.send(event);
            } catch (Exception e) {
                log.warn("SSE send failed for id={}, removing emitter: {}", id, e.getMessage());   // FIX: was e.printStackTrace()
                store.remove(id);
                emitter.complete();
            }
        }
    }

    public void completeUser(String userId) {
        completeEmitter(userId, userEmitters);
    }

    public void completeExpert(String expertId) {
        completeEmitter(expertId, expertEmitters);
    }

    private void completeEmitter(String id, Map<String, SseEmitter> store) {
        SseEmitter emitter = store.remove(id);
        if (emitter != null) {
            emitter.complete();
        }
    }

    public Map<String, SseEmitter> getExpertEmitters() { return expertEmitters; }
    public Map<String, SseEmitter> getUserEmitters()   { return userEmitters; }
}