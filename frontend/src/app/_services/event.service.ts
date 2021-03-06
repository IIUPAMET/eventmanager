import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Event} from '../_models';
import {Observable} from 'rxjs';
import {UserService} from "./user.service";
import {EventDTOModel} from "../_models/dto/eventDTOModel";
import {AuthenticationService} from "./authentication.service";
import {UpdateEventDTO} from "../_models/dto/UpdateEventDTO";

@Injectable()
export class EventService {
  private eventsUrl = 'api/events';

  constructor(private http: HttpClient,
              private userService: UserService) {
  }

  create(event: EventDTOModel) {
    console.log('event service: ' + JSON.stringify(event));
    const url = this.eventsUrl;
    return this.http.post<Event>(url, event, {headers: AuthenticationService.getAuthHeader()});
  }

  getAllEvents(): Observable<EventDTOModel[]> {
    let customerId = this.userService.getCurrentId();
    const url = `${this.eventsUrl}/public_and_friends?customerId=${customerId}`;
    return this.http.get<Event[]>(url, {headers: AuthenticationService.getAuthHeader()})
      .map(events => events.map(event => {
          let dto = new EventDTOModel();
          dto.event = event;
          return dto;
        })
      );
  }

  getEventsByCustId(): Observable<EventDTOModel[]> {
    let custId = this.userService.getCurrentId();
    const url = `${this.eventsUrl}/my${custId}`;
    return this.http.get<EventDTOModel[]>(url, {headers: AuthenticationService.getAuthHeader()})
  }

  getAllPublicEventsInMonth(): Observable<EventDTOModel[]> {
    let custId = this.userService.getCurrentId();
    const url = `${this.eventsUrl}/allPublic${custId}`;
    return this.http.get<EventDTOModel[]>(url, {headers: AuthenticationService.getAuthHeader()})
  }

  getAllPrivateEventsInMonth(): Observable<EventDTOModel[]> {
    let custId = this.userService.getCurrentId();
    const url = `${this.eventsUrl}/allPrivate${custId}`;
    return this.http.get<EventDTOModel[]>(url, {headers: AuthenticationService.getAuthHeader()})
  }

  getAllFriendsEventsInMonth(): Observable<EventDTOModel[]> {
    let custId = this.userService.getCurrentId();
    const url = `${this.eventsUrl}/allFriends${custId}`;
    return this.http.get<EventDTOModel[]>(url, {headers: AuthenticationService.getAuthHeader()})
  }

  getAllByCustId(): Observable<EventDTOModel[]> {
    let custId = this.userService.getCurrentId();
    const url = `${this.eventsUrl}/allEvents${custId}`;
    return this.http.get<EventDTOModel[]>(url, {headers: AuthenticationService.getAuthHeader()})
  }

  getEventsByCustIdSorted(): Observable<EventDTOModel[]> {
    let custId = this.userService.getCurrentId();
    const url = `${this.eventsUrl}/my/sorted${custId}`;
    return this.http.get<EventDTOModel[]>(url, {headers: AuthenticationService.getAuthHeader()})
  }

  getEventsByCustIdSortedType(): Observable<EventDTOModel[]> {
    let custId = this.userService.getCurrentId();
    const url = `${this.eventsUrl}/my/sorted/type${custId}`;
    return this.http.get<EventDTOModel[]>(url, {headers: AuthenticationService.getAuthHeader()})
  }

  getEventsByCustIdFilterByType(type: string): Observable<EventDTOModel[]> {
    let custId = this.userService.getCurrentId();
    const url = `${this.eventsUrl}/my/filter/${type}/${custId}`;
    return this.http.get<EventDTOModel[]>(url, {headers: AuthenticationService.getAuthHeader()})
  }

  getDraftsByCustId(): Observable<Event[]> {
    let custId = this.userService.getCurrentId();
    const url = `${this.eventsUrl}/drafts${custId}`;
    return this.http.get<Event[]>(url, {headers: AuthenticationService.getAuthHeader()})
  }

  getNotesByCustId(): Observable<Event[]> {
    let custId = this.userService.getCurrentId();
    const url = `${this.eventsUrl}/notes${custId}`;
    return this.http.get<Event[]>(url, {headers: AuthenticationService.getAuthHeader()})
  }

  getInvitesByCustId(): Observable<Event[]> {
    let custId = this.userService.getCurrentId();
    const url = `${this.eventsUrl}/invites${custId}`;
    return this.http.get<Event[]>(url, {headers: AuthenticationService.getAuthHeader()})
  }

  getEventById(eventId: string) {
    let custId = this.userService.getCurrentId();
    const url = `${this.eventsUrl}/event/${eventId}/${custId}`;
    return this.http.get<EventDTOModel>(url, {headers: AuthenticationService.getAuthHeader()});
  }

  getNoteById(eventId: string) {
    let custId = this.userService.getCurrentId();
    const url = `${this.eventsUrl}/note/${eventId}/${custId}`;
    return this.http.get<EventDTOModel>(url, {headers: AuthenticationService.getAuthHeader()});
  }

  deleteEvent(eventId: string) {
    const url = `${this.eventsUrl}/delete`;
    return this.http.post<number>(url, eventId, {headers: AuthenticationService.getAuthHeader()});
  }

  updateEvent(updatEventDTO: UpdateEventDTO) {
    const url = `${this.eventsUrl}/update`;
    console.log('Service EV '+JSON.stringify(updatEventDTO));
    return this.http.put<UpdateEventDTO>(url, updatEventDTO, {headers: AuthenticationService.getAuthHeader()});
  }

  updateEventNotif(eventDTO: EventDTOModel) {
    const url = `${this.eventsUrl}/updatenotif`;
    return this.http.put<EventDTOModel>(url, eventDTO, {headers: AuthenticationService.getAuthHeader()});
  }

  addParticipant(eventId) {
    let customerId = this.userService.getCurrentId();
    const url = `${this.eventsUrl}/addParticipant?customerId=${customerId}&eventId=${eventId}`;
    return this.http.get(url, {headers: AuthenticationService.getAuthHeader()});
  }

  removeParticipant(eventId) {
    let customerId = this.userService.getCurrentId();
    const url = `${this.eventsUrl}/removeParticipant?customerId=${customerId}&eventId=${eventId}`;
    return this.http.get(url, {headers: AuthenticationService.getAuthHeader()});
  }

  isParticipant(customerId: string, eventId: string) {
    const url = `${this.eventsUrl}/isParticipant?customerId=${customerId}&eventId=${eventId}`;
    return this.http.get(url, {headers: AuthenticationService.getAuthHeader()});
  }

  getNationalEvents(calendarId): Observable<Event[]> {
    const url = `${this.eventsUrl}/getNationalEvents?calendarId=${calendarId}`;
    return this.http.get<Event[]>(url, {headers: AuthenticationService.getAuthHeader()});
  }

  importEventsToPDF(email) {
    return this.http.get(`api/import/pdf?email=${email}`,
      {headers: AuthenticationService.getAuthHeader()})
  }

  updatePriority(eventId: string, priority: string) {
    const url = `${this.eventsUrl}/updatePriority?customerId=${this.userService.getCurrentId()}&eventId=${eventId}&priority=${priority}`;
    return this.http.get<Event[]>(url, {headers: AuthenticationService.getAuthHeader()});
  }

  getTimeline(login) {
    const url = `${this.eventsUrl}/timeline?login=${login}`;
    return this.http.get<EventDTOModel[]>(url, {headers: AuthenticationService.getAuthHeader()})
  }
}
