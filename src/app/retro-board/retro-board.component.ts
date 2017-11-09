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
  activeVote: boolean;
  jsonString: string;
  jsonData: Object;
  stuffContainer;
  htmlContainer;

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

  export() {
    this.clearExports();
    this.jsonString = JSON.stringify(this.jsonData);
    const newEle1 = document.createElement('div');
    newEle1.innerHTML = `<div>JSON</div><pre>${this.jsonString}</pre>`;
    this.stuffContainer.insertBefore(newEle1, null);
    let exportedHTML = '<div>HTML</div><pre><code class="html">';
    exportedHTML += `&lt;table class='confluenceTable'&gt;
  &lt;colgroup&gt;&lt;col&gt;&lt;col&gt;&lt;col&gt;&lt;/colgroup&gt;
`;
    Object.keys(this.jsonData).map(item => {
      Object.keys(this.jsonData[item]).map((note, i) => {
      exportedHTML += `&lt;tr&gt;
  `;
          if (i === 0) {
            exportedHTML += `&lt;td class='confluenceTh'&gt;${this.jsonData[item][note].bucketName}&lt;/td&gt;
  `;
          }else{
            exportedHTML += `&lt;td&gt;&lt;/td&gt;
  `;
          }
          exportedHTML += `&lt;td class='confluenceTd'&gt;${this.jsonData[item][note].message}&lt;/td&gt;
  `;
          exportedHTML += `&lt;td class='confluenceTd'&gt;${this.jsonData[item][note].votes}&lt;/td&gt;
  `;
      exportedHTML += `&lt;/tr&gt;
`;
      });
    });
    exportedHTML += `&lt;/table&gt;</code></pre>`;

    const newEle2 = document.createElement('div');
    newEle2.innerHTML = exportedHTML;
    this.htmlContainer.insertBefore(newEle2, null);
  }

  clearExports() {
    while (this.htmlContainer.firstChild) {
      this.htmlContainer.removeChild(this.htmlContainer.firstChild);
    }
    while (this.stuffContainer.firstChild) {
      this.stuffContainer.removeChild(this.stuffContainer.firstChild);
    }
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
    this.stuffContainer = document.getElementById('json-container');
    this.htmlContainer = document.getElementById('html-container');
  }

  addNote(message: string) {
    this.db.list(`/notes/${this.activeBucket.$key}`).push({message: message, votes: 0})
      .then(() => this.modalRef.hide());
    this.clearExports();
  }

  updateNote(message: string) {
    this.db.object(`/notes/${this.activeBucket.$key}/${this.activeNote.$key}`).update({message: message})
      .then(() => this.modalRef.hide());
    this.clearExports();
  }

  upVote() {
    this.activeNote.votes++;
    this.activeVote = true;
    this.db.object(`/notes/${this.activeBucket.$key}/${this.activeNote.$key}`).update({votes: this.activeNote.votes})
      .then(() => this.modalRef.hide());
  }

  undoVote() {
    this.activeNote.votes--;
    this.activeVote = false;
    this.db.object(`/notes/${this.activeBucket.$key}/${this.activeNote.$key}`).update({votes: this.activeNote.votes})
      .then(() => this.modalRef.hide());
    this.clearExports();
  }

  deleteNote() {
    this.db.object(`/notes/${this.activeBucket.$key}/${this.activeNote.$key}`).remove()
      .then(() => this.modalRef.hide());
    this.clearExports();
  }
}
