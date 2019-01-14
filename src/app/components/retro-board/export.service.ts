import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  export(jsonData: any): string {
    let exportedHTML = `<pre class="html-pre"><code class="html">`;
    exportedHTML += dateUserTableString(new Date().toLocaleDateString());
    exportedHTML += dataString(jsonData, noteString);
    exportedHTML += addlTasksString();
    exportedHTML += `</code></pre>`;
    return exportedHTML;
  }
}

function dateUserTableString(time) {
  return `&lt;table class='confluenceTable'&gt;
&lt;tbody&gt;
  &lt;tr&gt;
    &lt;th class='confluenceTh' &gt;Date&lt;/th&gt;
    &lt;td class='confluenceTd' &gt;&lt;time datetime='${time}'&gt;${time}&lt;/time&gt;&lt;/td&gt;
  &lt;/tr&gt;
  &lt;tr&gt;
    &lt;th class='confluenceTh' &gt;Participants&lt;/th&gt;
    &lt;td class='confluenceTd' &gt;&lt;/td&gt;
  &lt;/tr&gt;
&lt;/tbody&gt;
&lt;/table&gt;`;
}

function dataString(data, fxn) {
  let returnString = `
&lt;div class='columnLayout three-equal' data-layout='three-equal'&gt;`;
  Object.keys(data).map((item) => {
    Object.keys(data[item]).map((note, i) => {
      returnString += fxn(item, note, i, data);
    });
  });
  returnString += `
&lt;/div&gt;`;
  return returnString;
}

function noteString(item, note, i, data) {
  let returnString = '';
  let css = '';
  switch (data[item][note].type) {
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
    returnString += `
  &lt;div class='cell normal' style='${css}' data-type='normal'&gt;
    &lt;div class='innerCell' contenteditable='true'&gt;
      &lt;table class='confluenceTable'&gt;
        &lt;colgroup&gt;&lt;col&gt;&lt;col&gt;&lt;col&gt;&lt;/colgroup&gt;`;
  }
  returnString += `
        &lt;tr&gt;`;
  if (i === 0) {
    returnString += `
          &lt;p style='color:#333;background:#eee;' class='confluenceTh'&gt;${
            data[item][note].bucketName
          }&lt;/p&gt;`;
  }
  returnString += `
          &lt;td style='width:10%;${css}' class='confluenceTd'&gt;${
    data[item][note].votes
  }&lt;/td&gt;
          &lt;td style='width:90%;${css}' class='confluenceTd'&gt;${
    data[item][note].message
  }&lt;/td&gt;
        &lt;/tr&gt;`;
  if (i === Object.keys(data[item]).length - 1) {
    returnString += `
      &lt;/table&gt;
    &lt;/div&gt;
  &lt;/div&gt;`;
  }
  return returnString;
}

function addlTasksString() {
  return `
&lt;hr&gt;
&lt;h2&gt;Tasks&lt;/h2&gt;
&lt;ul class="inline-task-list"&gt;
&lt;li data-inline-task-id=""&gt;
  &lt;span&gt;Type your task here, using "@" to assign to a user and "//" to select a due date&lt;/span&gt;
&lt;/li&gt;
&lt;/ul&gt;`;
}
