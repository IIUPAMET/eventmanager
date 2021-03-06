import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {EventDTOModel} from "../../_models/dto/eventDTOModel";
import {AlertService, EventService, UserService} from "../../_services";
import {ActivatedRoute, Router} from "@angular/router";
import {VISIBILITY} from "../../event-visibility";
import {Location} from "../../_models/location";
import {tap} from "rxjs/operators";

@Component({
  selector: 'app-event-create',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css']
})
export class CreateEventComponent implements OnInit {
  @Input('noteId') noteId: string;
  @Input('eventId') eventId: string;

  eventDTO: EventDTOModel;
  eventForm: FormGroup;
  additionEventForm: FormGroup;
  eventDTOForm: FormGroup;
  isNote: boolean = false;
  isDraft: boolean = false;

  nameNote: string;
  descriptionNote: string;
  startDateDraft: string;
  endDateDraft: string;
  visibilityDraft: string;
  priorityDraft: string;
  peopleDraft: string[];

  isValidFormSubmitted = null;

  visibilityList: any[] = VISIBILITY;
  visibility: string;
  selectedPeople: string[] = [];
  eventLocation: Location;
  date;

  constructor(private router: Router,
              private eventService: EventService,
              private activatedRoute: ActivatedRoute,
              private alertService: AlertService,
              private formBuilder: FormBuilder,
              private userService: UserService) {
  }

  get name() {
    return this.eventForm.get('name');
  }

  get description() {
    return this.eventForm.get('description');
  }

  get startTime() {
    return this.eventForm.get('startTime');
  }

  get endTime() {
    return this.eventForm.get('endTime');
  }

  get frequencyNumber() {
    return this.additionEventForm.get('frequencyNumber');
  }

  ngOnInit(): void {
    this.eventForm = this.initEventForm();
    this.additionEventForm = this.initAdditionEventForm();
    this.eventDTOForm = this.formBuilder.group({
      event: this.eventForm,
      additionEvent: this.additionEventForm
    });
    this.activatedRoute.params.subscribe(params => {
      let type = params['type'];
      switch (type) {
        case 'note' : {
          this.isNote = true;
          this.noteId = this.activatedRoute.snapshot.paramMap.get('id');
          this.getNoteById();
          break;
        }
        case 'draft' : {
          this.isDraft = true;
          this.getDraftById();
          break;
        }
      }
    });
  }

  initEventForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40), Validators.pattern("^[ a-zA-Zа-яА-ЯієїґІЄЇҐ]*$")]],
      description: ['', [Validators.maxLength(2048)]],
      startTime: new FormControl(),
      endTime: new FormControl(),
      visibility: new FormControl()
    }, {validator: [this.dateLessThan('startTime', 'endTime'), this.bothOrNone('startTime', 'endTime'), this.dateBeforeNow('startTime')]})
  }

  initAdditionEventForm(): FormGroup {
    return this.formBuilder.group({
      frequencyNumber: ['', [Validators.min(1)]],
      frequencyPeriod: new FormControl(''),
      priority: new FormControl(''),
      people: new FormControl('')
    })
  }

  addUserToEvent(manLogin: string) {
    if (!this.selectedPeople.includes(manLogin)) {
      this.selectedPeople.push(manLogin);
    }
  }

  deleteUserFromEvent(login: string) {
    if (this.selectedPeople.includes(login)) {
      const index = this.selectedPeople.indexOf(login);
      this.selectedPeople.splice(index, 1);
    }
  }

  createEventForm(eventDTO: EventDTOModel) {
    if (this.eventForm.invalid || this.additionEventForm.invalid) {
      this.alertService.error("You input is wrong. Please, check and try again", false);
      return;
    }
    this.isValidFormSubmitted = true;
    if (eventDTO.event.name == null) {
      eventDTO.event.name = this.eventDTO.event.name;
    }
    if (eventDTO.event.description == null) {
      eventDTO.event.description = this.eventDTO.event.description;
    }
    this.isValidFormSubmitted = false;
    if (eventDTO.event.startTime != null) {
      eventDTO.event.startTime = (eventDTO.event.startTime).slice(0, 10) + ' ' + (eventDTO.event.startTime).slice(11, 16) + ':00';
    }
    if (eventDTO.event.endTime != null) {
      eventDTO.event.endTime = (eventDTO.event.endTime).slice(0, 10) + ' ' + (eventDTO.event.endTime).slice(11, 16) + ':00';
    } else {
      eventDTO.event.startTime = this.startDateDraft;
      eventDTO.event.endTime = this.endDateDraft;
    }
    if ((eventDTO.event.visibility == null) && (this.visibilityDraft != null)) {
      eventDTO.event.visibility = this.visibilityDraft;
    }
    if ((eventDTO.additionEvent.priority == null) && (this.priorityDraft != null)) {
      eventDTO.additionEvent.priority = this.priorityDraft;
    }
    if ((eventDTO.additionEvent.people == null) && (this.peopleDraft != null)) {
      eventDTO.additionEvent.people = this.peopleDraft;
    }
    eventDTO.additionEvent.people = this.selectedPeople;
    eventDTO.additionEvent.location = this.eventLocation;
    let customerId = this.userService.getCurrentId();
    eventDTO.event.creatorId = customerId;
    console.log('createEventForm value: '+this.eventDTOForm.value);
    this.eventService.create(eventDTO).subscribe(
      data => {
        if ((eventDTO.event.startTime != null) && (eventDTO.event.startTime != '')) {
          if (eventDTO.event.visibility == 'PUBLIC') {
            this.alertService.info('Public event successfully created! You can invite people to your event.', true);
            this.router.navigate(['../home']);
          } else {
            this.alertService.info('Event successfully created!', true);
            this.router.navigate(['../home']);
          }
        } else {
          this.alertService.info('Note successfully created!', true);
          this.router.navigate(['../folder-list', 'all']);
        }
      },
      error => {
        this.alertService.error('Something wrong! Please try again!');
      });
  }

  saveAsADraft(eventDTO: EventDTOModel) {
    if (this.eventForm.invalid || this.additionEventForm.invalid) {
      this.alertService.error("You input is wrong. Please, check and try again", false);
      return;
    }
    // if(eventDTO.event.startTime==null || eventDTO.event.startTime=='' || eventDTO.event.endTime==null || eventDTO.event.endTime=='') {
    //   this.alertService.error("Please, specify dates for draft", false);
    //   return;
    // }
    this.isValidFormSubmitted = true;
    console.log('In create-ivent/ saveAsDraft 1: ' + JSON.stringify(eventDTO));
    if (eventDTO.event.name == null) {
      eventDTO.event.name = this.eventDTO.event.name;
    }
    if (eventDTO.event.description == null) {
      eventDTO.event.description = this.eventDTO.event.description;
    }
    this.isValidFormSubmitted = true;
    if (eventDTO.event.startTime != null) {
      eventDTO.event.startTime = (eventDTO.event.startTime).slice(0, 10) + ' ' + (eventDTO.event.startTime).slice(11, 16) + ':00';
    }
    if (eventDTO.event.endTime != null) {
      eventDTO.event.endTime = (eventDTO.event.endTime).slice(0, 10) + ' ' + (eventDTO.event.endTime).slice(11, 16) + ':00';
    } else {
      eventDTO.event.startTime = this.startDateDraft;
      eventDTO.event.endTime = this.endDateDraft;
    }
    eventDTO.event.status = 'DRAFT';
    eventDTO.additionEvent.people = this.selectedPeople;
    eventDTO.additionEvent.location = this.eventLocation;
    let customerId = this.userService.getCurrentId();
    eventDTO.event.creatorId = customerId;
    console.log('In create-ivent/ saveAsDraft 2: ' + JSON.stringify(eventDTO));
    this.eventService.create(eventDTO).subscribe(data => {
        this.alertService.success('Draft successfully saved!', true);
        this.router.navigate(['../home']);
      },
      error => {
        this.alertService.error('Not saved! We working.. please try again');
      });
  }

  dateBeforeNow(start: string) {
    return (group: FormGroup): {
      [key: string]: any} => {
      let startTime = group.controls[start].value;
      return Date.parse(startTime) < Date.now()  ? {dateBeforeNow:"Event cannot starts in the past"} : {}
    }
  }

  bothOrNone(start: string, end: string) {
    return (group: FormGroup): {
      [key: string]: any} => {
      let startTime = group.controls[start].value;
      let endTime = group.controls[end].value;
      return Boolean(startTime) !== Boolean(endTime) ? {onlyOne:"You must specify both dates or none of them (for note)"} : {}
    }

  }

  dateLessThan(from: string, to: string) {
    return (group: FormGroup): { [key: string]: any } => {
      let startTime = group.controls[from].value;
      let endTime = group.controls[to].value;
      if (Boolean(startTime) && Boolean(endTime) && startTime >= endTime) {
        return {
          endLessThanStart: "Start time should be less than end time"
        };
      }
      return {};
    }
  }

  getNoteById(): void {
    this.eventService.getNoteById(this.noteId)
      .pipe(tap(eventDTO => this.eventDTOForm.patchValue(eventDTO)))
      .subscribe((eventDTO) => {
        this.eventDTO = eventDTO;
        this.nameNote = this.eventDTO.event.name;
        this.descriptionNote = this.eventDTO.event.description;
      });
  }

  getDraftById(): void {
    this.eventId = this.activatedRoute.snapshot.paramMap.get('id');
    const id = this.eventId;
    this.eventService.getEventById(id)
      .pipe(tap(eventDTO => this.eventDTOForm.patchValue(eventDTO)))
      .subscribe((eventDTO: EventDTOModel) => {
      this.eventDTO = eventDTO;
      this.isNote = true;
      this.startDateDraft = this.eventDTO.event.startTime;
      this.endDateDraft = this.eventDTO.event.endTime;
      this.visibilityDraft = this.eventDTO.event.visibility;
    });
  }

  addLocation(location: Location) {
    this.eventLocation = location;
    console.log('create-event ' + this.eventLocation.street);
    console.log('create-event ' + this.eventLocation.house);
  }

}
