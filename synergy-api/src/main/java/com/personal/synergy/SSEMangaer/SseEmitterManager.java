package com.personal.synergy.SSEMangaer;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SseEmitterManager {

    /*
     Stores active SSE connections for users.
     key   -> userId
     value -> SseEmitter instance
     Used to send call status events to users.
     */
    private final Map<String, SseEmitter> userEmitters = new ConcurrentHashMap<>();

    /*
     Stores active SSE connections for experts.
     key   -> expertId
     value -> SseEmitter instance
     Used to notify experts about incoming calls.
     */
    private final Map<String, SseEmitter> expertEmitters = new ConcurrentHashMap<>();


    /*
     1.create  SSE connection for a user
     2.store emitter in userEmitters map
     3.register cleanup callbacks
     4.send initial "connected" status event
     */
    public SseEmitter addUserEmitter(String userId) {
        return addEmitter(userId, userEmitters);
    }

    /*
     1.create SSE connection for an expert
     2.store emitter in expertEmitters map
     3.register cleanup callbacks
     4.send initial "connected" status event
    */
    public SseEmitter addExpertEmitter(String expertId) {
        return addEmitter(expertId, expertEmitters);
    }

    /*
     1.create a new SseEmitter with no timeout (0L)
     2.store emitter in the given map (user or expert)
     3.register cleanup logic for:
        -> normal completion
        -> timeout
        -> error
     4.send initial status event to client
     5.return emitter to controller
     */
    private SseEmitter addEmitter(String id,
                                  Map<String, SseEmitter> store) {

        // create emitter with infinite timeout
        SseEmitter emitter = new SseEmitter(0L);
        store.put(id, emitter); // store emitter in emitter store

        // cleanup logic to remove emitter from map
        Runnable cleanup = () -> store.remove(id);

        //emitter cleanup
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        // send initial event to confirm connection
        try {
            emitter.send(SseEmitter.event().name("status").data("connected"));
            System.out.println("Stored emitter for: " + id);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return emitter;
    }

    /*
     1.fetch user emitter from map
     2.send event if emitter exists
     3.on failure remove emitter and close connection
   */
    public void sendToUser(String userId,
                           SseEmitter.SseEventBuilder event) {
        sendEvent(userId, event, userEmitters);
    }

    /*
    1.fetch expert emitter from map
    2.send event if emitter exists
    3.on failure remove emitter and close connection
    */
    public void sendToExpert(String expertId,
                             SseEmitter.SseEventBuilder event) {
        sendEvent(expertId, event, expertEmitters);
    }

    /*
     1.get emitter from store using id
     2.if emitter exists send SSE event
     3.if send fails:
       -> remove emitter from map
       -> complete emitter
    */
    private void sendEvent(String id,
                           SseEmitter.SseEventBuilder event,
                           Map<String, SseEmitter> store) {
        SseEmitter emitter = store.get(id);
        if (emitter != null) {
            try {
                emitter.send(event);
            } catch (Exception e) {
                e.printStackTrace();
                store.remove(id);
                emitter.complete();
            }
        }
    }

    /*
    1.remove user emitter from map
    2.close SSE connection safely
    */
    public void completeUser(String userId) {
        completeEmitter(userId, userEmitters);
    }

    /*
    1.remove expert emitter from map
    2complete SSE connection safely
    */
    public void completeExpert(String expertId){
        completeEmitter(expertId, expertEmitters);
    }

    /*
     1.remove emitter from store
     2.if emitter exists call complete()
     */
    private void completeEmitter(String id, Map<String, SseEmitter> store) {
        SseEmitter emitter = store.remove(id);
        if (emitter != null) {
            emitter.complete();
        }
    }

    /*
     returns all active expert SSE connections.
    */
    public Map<String, SseEmitter> getExpertEmitters() {
        return expertEmitters;
    }

    /*
     returns all active user SSE connections.
    */
    public Map<String, SseEmitter> getUserEmitters() {
        return userEmitters;
    }
}
