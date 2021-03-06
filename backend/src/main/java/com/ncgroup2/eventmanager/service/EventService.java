package com.ncgroup2.eventmanager.service;

import com.ncgroup2.eventmanager.dto.EventCountdownDTO;
import com.ncgroup2.eventmanager.dto.EventDTO;
import com.ncgroup2.eventmanager.dto.InviteNotificationDTO;
import com.ncgroup2.eventmanager.dto.UpdateEventDTO;
import com.ncgroup2.eventmanager.entity.Event;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface EventService {

    void createEvent(EventDTO eventDTO);

    void createEventInvitations(List<String> login, UUID eventId);

    List<EventDTO> getAllPublicEventsInMonth(String custId);
    List<EventDTO> getAllPrivateEventsInMonth(String custId);
    List<EventDTO> getAllFriendsEventsInMonth(String custId);
    List<EventDTO> getAllEventsByCustId(String custId);

    List<EventDTO> getEventsByCustId(String custId);

    List<EventDTO> getEventsByCustIdSorted(String custId);

    List<EventDTO> getEventsByCustIdSortedByType(String custId);

    List<EventDTO> getEventsByCustIdFilterByType(String custId, String type);

    EventDTO getEventById(String eventId, String custId);

    EventDTO getNoteById(String noteId, String custId);

    void deleteEventById(String eventId);

    void updateEventNotif(EventDTO eventDTO);

    void updateEvent(UpdateEventDTO eventDTO);

    List<Event> getAllPublicAndFriendsEvents(String customerId);

    boolean isParticipant(String customerId, String eventId);

    void removeParticipant(String customerId, String eventId);

    void addParticipant(String customerId, String eventId);

    List<EventCountdownDTO> getCountdownMessages();

    List<Event> getDraftsByCustId(String custId);

    List<Event> getNotesByCustId(String custId);

    List<Event> getInvitesByCustId(String custId);

    List<InviteNotificationDTO> getInviteNotifications(String customerId);

    List<Event> getNationalEvents(String calendarId, LocalDateTime from, LocalDateTime to) throws Exception;

    List<EventDTO> getTimeline(String login, LocalDateTime from, LocalDateTime to);

    void updatePriority(String customerId, String eventId, String priority);
}
