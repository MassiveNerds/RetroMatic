import {Component, OnInit, TemplateRef} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import {BsModalService} from 'ngx-bootstrap/modal';
import {BsModalRef} from 'ngx-bootstrap/modal/modal-options.class';
import {Router, ActivatedRoute, ParamMap} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';


@Component({
  selector: 'app-retro-board',
  templateUrl: './retro-board.component.html',
  styleUrls: ['./retro-board.component.css']
})
export class RetroBoardComponent implements OnInit {
  user: Observable<firebase.User>;
  uid: string;
  retroboard: Observable<any>;
  buckets: Observable<any[]>;
  modalRef: BsModalRef;
  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: false
  };
  activeBucket: any;
  activeNote: any;
  jsonString: string;
  jsonData: Object;

  constructor(private db: AngularFireDatabase,
              private modalService: BsModalService,
              private route: ActivatedRoute,
              private router: Router,
              public afAuth: AngularFireAuth) {
    this.user = afAuth.authState;
    this.user.subscribe(result => this.uid = result.uid);
  }

  compareFn = (a, b) => {
    if (a.votes < b.votes) {
      return 1;
    }
    if (a.votes > b.votes) {
      return -1;
    }
    return 0;
  }

  openModal(template: TemplateRef<any>, bucket: any, note?: any) {
    this.activeBucket = bucket;
    if (note) {
      this.activeNote = note;
    }
    this.modalRef = this.modalService.show(template, this.config);
  }

  exportToJSON() {
    this.jsonString = JSON.stringify(this.jsonData);
    const newEle = document.createElement('pre');
    newEle.innerHTML = this.jsonString;
    const stuffContainer = document.getElementById('json-container');
    while (stuffContainer.firstChild) {
      stuffContainer.removeChild(stuffContainer.firstChild);
    }
    stuffContainer.insertBefore(newEle, null);
  }

  exportToHTML() {
    let exportedHTML = '<pre><code class="html">';
    Object.keys(this.jsonData).map(item => {
      Object.keys(this.jsonData[item]).map((note, i) => {
        if (i === 0) {
          exportedHTML += `<h2>${this.jsonData[item][note].bucketName}</h2>`;
        }
        exportedHTML += `<div class='wrapper'>`;
          exportedHTML += `<div class='message'>${this.jsonData[item][note].message}</div>`;
          exportedHTML += `<div class='votes'>${this.jsonData[item][note].votes}</div>`;
        exportedHTML += `</div>`;
      });
    });
    exportedHTML += '</code></pre>';

    const newEle = document.createElement('div');
    newEle.innerHTML = exportedHTML;
    const htmlContainer = document.getElementById('html-container');

    while (htmlContainer.firstChild) {
      htmlContainer.removeChild(htmlContainer.firstChild);
    }
    htmlContainer.insertBefore(newEle, null);
  }

  ngOnInit() {
    this.buckets = this.route.paramMap
      .switchMap((params: ParamMap) => this.db.list(`/buckets/${params.get('id')}`))
      .map((buckets) => {
        return buckets.map(bucket => {
          bucket.notes = this.db.list(`/notes/${bucket.$key}`)
            .map(notes => notes.sort(this.compareFn));
          return bucket;
        });
      });
    this.jsonData = {};
    this.buckets.subscribe(data => {
      data.map(bucket => {
        this.db.list(`/notes/${bucket.$key}`)
          .subscribe(notes => {
            notes.map(note => {
              if (!this.jsonData[bucket.$key]) {
                this.jsonData[bucket.$key] = {};
              }
              this.jsonData[bucket.$key][note.$key] = {
                'bucketName': bucket.name,
                'message': note.message,
                'votes': note.votes
              };
            });
          });
      });
    });
  }

  addNote(message: string) {
    this.db.list(`/notes/${this.activeBucket.$key}`).push({message: message, votes: 0})
      .then(() => this.modalRef.hide());
  }

  updateNote(message: string) {
    this.db.object(`/notes/${this.activeBucket.$key}/${this.activeNote.$key}`).update({message: message})
      .then(() => this.modalRef.hide());
  }

  vote() {
    this.activeNote.votes++;
    this.db.object(`/notes/${this.activeBucket.$key}/${this.activeNote.$key}`).update({votes: this.activeNote.votes})
      .then(() => this.modalRef.hide());
  }

  deleteNote() {
    this.db.object(`/notes/${this.activeBucket.$key}/${this.activeNote.$key}`).remove()
      .then(() => this.modalRef.hide());
  }
}
