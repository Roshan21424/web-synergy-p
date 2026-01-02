package com.personal.synergy.controller;



import com.personal.synergy.SSEMangaer.SseEmitterManager;
import com.personal.synergy.entity.ExpertInfo;
import com.personal.synergy.entity.Session;
import com.personal.synergy.entity.User;
import com.personal.synergy.repository.SessionRepository;
import com.personal.synergy.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
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


@RestController
@RequestMapping("/api/call")
@CrossOrigin(origins = "https://localhost:3000") // allow your React dev server
@RequiredArgsConstructor
public class CallController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SessionRepository sessionRepository;

    /* SSE emitter */
    @Autowired
    private SseEmitterManager emitterManager;

    /* redis template  */
    private final StringRedisTemplate redisTemplate;

    /* expert registry */
    private final Map<String, ExpertInfo> expertRegistry = new ConcurrentHashMap<>();

    /* time intervals and scheduler */
    private static final long PENDING_CALL_TTL = 30;     // call request timeout (seconds)
    private static final long HEARTBEAT_INTERVAL = 15;   // SSE heartbeat interval (seconds)
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2); //scheduler


    /*
    Initializes periodic background tasks after bean creation.
     1.Sends heartbeat events to all connected experts
         -keeps SSE alive
         -updates expert presence in Redis
     2. Logs all active expert SSE connections (for debugging)
    */
    @PostConstruct
    public void initHeartbeat() {
        // send heartbeat to all experts
        scheduler.scheduleAtFixedRate(() -> {
            emitterManager.getExpertEmitters().forEach((expertId, emitter) -> {
                try {
                    emitter.send(SseEmitter.event().name("heartbeat").data("ping"));
                    maintainPresence(expertId);
                } catch (Exception ex) {
                    ex.printStackTrace();
                    emitter.complete();
                    emitterManager.completeExpert(expertId);
                }
            });
        }, HEARTBEAT_INTERVAL, HEARTBEAT_INTERVAL, TimeUnit.SECONDS);

        // log all active expert emitters
        scheduler.scheduleAtFixedRate(() -> {
            System.out.println("=== Active Expert SSE Connections ===");
            emitterManager.getExpertEmitters().forEach((expertId, emitter) -> {
                System.out.println("ExpertId: " + expertId + ", Emitter: " + emitter);
            });
            System.out.println("===================================");
        }, 0, 5, TimeUnit.SECONDS);
    }

    /*
    Maintains expert availability presence in Redis.
    Called on every heartbeat.
    Key expires automatically if heartbeats stop,
    indicating the expert went offline.
    */
    private void maintainPresence(String expertId) {
        redisTemplate.opsForValue().set("expert:avail:" + expertId, "1", 30, TimeUnit.SECONDS);
    }

    /*
     Creates SSE connection for a user.
     2.notify call status
     3.receive acceptance/rejection events
     */
    @GetMapping(value = "/sse/user", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeUser(@RequestParam String userId) {
        return emitterManager.addUserEmitter(userId);
    }

    /*
    Creates a SSE connection for an expert
    1. Create SSE emitter
    2. Load expert details from DB
    3. Build ExpertInfo object
    4. Store expert in in-memory registry
    5. Send INIT event
    6. Cleanup registry on disconnect
    */
    @GetMapping(value = "/sse/expert", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeExpert(@RequestParam String expertId,
                                      @RequestParam String field,
                                      @RequestParam String subField) {
        //  Create new SSE connection
        SseEmitter emitter = emitterManager.addExpertEmitter(expertId);

        // Fetch full expert details from db(mysql)
        User expertUser = userRepository.findById(Long.valueOf(expertId)).orElseThrow(() -> new RuntimeException("Expert not found in DB"));

        // Build  ExpertInfo
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

        // Store in registry
        expertRegistry.put(expertId, expertInfo);

        // Send INIT event
        try {
            emitter.send(SseEmitter.event().name("INIT").data("Connected at " + expertInfo.getLiveSince()));
        } catch (IOException e) {
            e.printStackTrace();
            emitter.completeWithError(e);
        }

        // Clean up on disconnect
        emitter.onCompletion(() -> expertRegistry.remove(expertId));
        emitter.onTimeout(() -> expertRegistry.remove(expertId));
        emitter.onError((ex) -> expertRegistry.remove(expertId));

        return emitter;
    }

    /*
    1.create a key for the call in redis
    2.put the key in the redis
    3.if key already there ,then return status as busy
    4.notify the expert and send data userid
    5.notify the user and send data "waiting for expert..."
    6.schedule a time for 30 sec
      ->get the key from redis
      ->if call was from current user
      ->delete the key
      ->notify user and send data "timeout"
      ->close the connection
    7.return status as pending
     */
    @PostMapping("/request")
    public Map<String, String> requestCall(@RequestParam String userId,
                                           @RequestParam String expertId) {

        // create a key for redis
        String key = "call:" + expertId;

        // put the key in the redis with pending call
        Boolean result = redisTemplate.opsForValue().setIfAbsent(key, userId, PENDING_CALL_TTL, TimeUnit.SECONDS);

        // if the result  was null or result was false
        if (result == null || !result) {
            return Map.of("status", "busy"); //return status as busy
        }

        // notify expert through SSE
        emitterManager.sendToExpert(expertId, SseEmitter.event().name("incoming-call").data(userId));

        // notify user through SSE
        emitterManager.sendToUser(userId, SseEmitter.event().name("call-pending").data("Waiting for expert..."));

        // auto-timeout scheduler if unanswered
        scheduler.schedule(() -> {
            String current = redisTemplate.opsForValue().get(key); //fetch the call key and get from the value from redis

            //if userId equals to current(because call might also be from someone else)
            if (userId.equals(current)) {
                redisTemplate.delete(key); //delete the key
                emitterManager.sendToUser(userId, SseEmitter.event().name("call-rejected").data("timeout")); //notify the user with the call rejected event and send "timeout"
                emitterManager.completeUser(userId); //safely close the sse connection for the user
            }
        }, PENDING_CALL_TTL, TimeUnit.SECONDS);

        return Map.of("status", "pending"); //return "status" for the "pending" after the request
    }

    /*
     handles call acceptance by expert
     1.build key
     2.get current user from redis
     3.if user not found return status
     4.remove users call entry from redis
     5.create a session id
     6.create a session and save it db
     7.notify user
     8.disconnect user his SSE connection and removing his call entry from user registry
     9.notify expert
     */
    @PostMapping("/accept")
    public Map<String, String> accept(@RequestParam String expertId,
                                      @RequestParam String userId) {

        String key = "call:" + expertId;  // build the call key

        String currentUser = redisTemplate.opsForValue().get(key); // get the current user from redis

        // if user not found return status
        if (currentUser == null || !currentUser.equals(userId)) {
            return Map.of("status", "no_request");
        }

        redisTemplate.delete(key); // remove the users call entry from redis as it is accepted

        //create a session id
        String sessionId = "session-" + System.currentTimeMillis();

        //create session and save in session in db (mysql)
        Session session = new Session(sessionId, userId, expertId);
        sessionRepository.save(session);

        // notify user
        emitterManager.sendToUser(userId, SseEmitter.event().name("call-accepted").data(sessionId));

        //close users SSE and remove entry from expert registry
        emitterManager.completeUser(userId);

        //notify expert
        emitterManager.sendToExpert(expertId, SseEmitter.event().name("call-accepted").data(sessionId));

        return Map.of("status", "accepted", "sessionId", sessionId);
    }

    /*
     handles call from user.
     1.build call key
     2.delete the call entry from redis
     3.send notification to user
     4.disconnect user his SSE connection and removing his call entry from user registry
     5.send notification to expert
     */
    @PostMapping("/reject")
    public Map<String, String> reject(@RequestParam String expertId,
                                      @RequestParam String userId) {

        String key = "call:" + expertId; //build call key

        redisTemplate.delete(key); //deleted call from redis

        // send notification to user
        emitterManager.sendToUser(userId, SseEmitter.event().name("call-rejected").data("Expert rejected!"));

        emitterManager.completeUser(userId); //remove users SSE connection and entry from user registry

        // send notification to user
        emitterManager.sendToExpert(expertId, SseEmitter.event().name("call-rejected").data(userId));

        return Map.of("status", "rejected");
    }

    /*
    handles fetching experts.
    1.pick all the values present in expert registry in stream
    2.apply filter on stream such that
     -> if field is null or field matches experts field
     -> and if subfield is null or subfield matches experts subfield include them
    */
    @GetMapping("/experts")
    public List<ExpertInfo> searchExperts(@RequestParam(required = false) String field,
                                          @RequestParam(required = false) String subField) {

        return expertRegistry.values().stream().filter(expert -> (field == null || expert.getField().equalsIgnoreCase(field)) && (subField == null || expert.getSubField().equalsIgnoreCase(subField))).toList();
    }

}
