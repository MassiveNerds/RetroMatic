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
  styleUrls: ['./retro-board.component.less']
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
  jsonContainer;
  htmlContainer;
  exportOpen = false;
  timeNow = new Date().toLocaleDateString();

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

  exportData() {
    this.clearExports();
    this.exportOpen = !this.exportOpen;
    this.jsonString = JSON.stringify(this.jsonData);
    const newEle1 = document.createElement('div');
    newEle1.innerHTML = `<pre class="json-pre">${this.jsonString}</pre>`;
    this.jsonContainer.insertBefore(newEle1, null);
    let exportedHTML = '<pre class="html-pre"><code class="html">';
    exportedHTML += `&lt;table class='confluenceTable'&gt;
  &lt;tbody&gt;
    &lt;tr&gt;
      &lt;th class='confluenceTh' &gt;Date&lt;/th&gt;
      &lt;td class='confluenceTd' &gt;&lt;time datetime='${this.timeNow}'&gt;${this.timeNow}&lt;/time&gt;&lt;/td&gt;
    &lt;/tr&gt;
    &lt;tr&gt;
      &lt;th class='confluenceTh' &gt;Participants&lt;/th&gt;
      &lt;td class='confluenceTd' &gt;&lt;/td&gt;
    &lt;/tr&gt;
  &lt;/tbody&gt;
&lt;/table&gt;

&lt;div class='columnLayout three-equal' data-layout='three-equal'&gt;`;
    Object.keys(this.jsonData).map(item => {
      Object.keys(this.jsonData[item]).map((note, i) => {
        let css = '';
        switch (this.jsonData[item][note].type) {
            case 'success':
              css = 'background-color:#f3f9f4;border-color:#91c89c;';
              break;
            case 'danger':
              css = 'background-color:#fff8f7;border-color:#d04437;';
              break;
            case 'info':
              css = 'background-color:#f7f7ff;border-color:#7f8bff;';
              break;
            default:
              css = '';
          }
        if (i === 0) {
          exportedHTML += `
  &lt;div class='cell normal' style='${css}' data-type='normal'&gt;
    &lt;div class='innerCell' contenteditable='true'&gt;
      &lt;table class='confluenceTable'&gt;
        &lt;colgroup&gt;&lt;col&gt;&lt;col&gt;&lt;col&gt;&lt;/colgroup&gt;`;
        }
          exportedHTML += `
        &lt;tr&gt;`;
        if (i === 0) {
          exportedHTML += `
          &lt;p style='color:#333;background:#eee;' class='confluenceTh'&gt;${this.jsonData[item][note].bucketName}&lt;/p&gt;`;
        }
        exportedHTML += `
          &lt;td style='width:10%;${css}' class='confluenceTd'&gt;${this.jsonData[item][note].votes}&lt;/td&gt;`;
        exportedHTML += `
          &lt;td style='width:90%;${css}' class='confluenceTd'&gt;${this.jsonData[item][note].message}&lt;/td&gt;`;
        exportedHTML += `
        &lt;/tr&gt;`;
      });
      exportedHTML += `
      &lt;/table&gt;
    &lt;/div&gt;
  &lt;/div&gt;`;
    });
    exportedHTML += `
&lt;/div&gt;`;
    exportedHTML += `
&lt;hr&gt;
&lt;h2&gt;Tasks&lt;/h2&gt;
&lt;ul class="inline-task-list"&gt;
  &lt;li data-inline-task-id=""&gt;
    &lt;span&gt;Type your task here, using "@" to assign to a user and "//" to select a due date&lt;/span&gt;
  &lt;/li&gt;
&lt;/ul&gt;`;
    exportedHTML += `</code></pre>`;
    const newEle2 = document.createElement('div');
    newEle2.innerHTML = exportedHTML;
    this.htmlContainer.insertBefore(newEle2, null);
  }

  clearExports() {
    while (this.htmlContainer.firstChild) {
      this.htmlContainer.removeChild(this.htmlContainer.firstChild);
    }
    while (this.jsonContainer.firstChild) {
      this.jsonContainer.removeChild(this.jsonContainer.firstChild);
    }
  }

  selectText(containerid) {
    let range;
    if ((document as any).selection) {
      range = (document.body as any).createTextRange();
      range.moveToElementText(document.getElementById(containerid));
      range.select();
    } else if (window.getSelection) {
      range = document.createRange();
      range.selectNode(document.getElementById(containerid));
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
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
                'type': bucket.type,
                'bucketName': bucket.name,
                'message': note.message,
                'votes': note.votes
              };
            });
          });
      });
    });
    this.jsonContainer = document.getElementById('json-container');
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
    this.clearExports();
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
