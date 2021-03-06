import * as observable from 'tns-core-modules/data/observable';
import * as pages from 'tns-core-modules/ui/page';
import * as fs from 'tns-core-modules/file-system';
import { HelloWorldModel } from './main-view-model';

import { Zip } from 'nativescript-zip';

var model: HelloWorldModel;

// Event handler for Page 'loaded' event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
    // Get the event sender
    let page = <pages.Page>args.object;
    page.bindingContext = model = new HelloWorldModel();
}

const dest = fs.Folder.fromPath(fs.path.join(fs.knownFolders.temp().path, 'books'));
const destZip = fs.Folder.fromPath(fs.path.join(fs.knownFolders.temp().path, 'test.zip'));

export function unzip() {
  console.log(`begin unzip`);
  let appPath = fs.knownFolders.currentApp().path;
  let testZipFile = fs.path.join(appPath, 'test_70mb.zip');
  // Zip.unzip(testZipFile, appPath);
  Zip.unzipWithProgress(testZipFile, dest.path, onZipProgress, true)
    .then(() => {
      console.log(`unzip succesfully completed`);
    })
    .catch((err) => {
      console.log(`unzip error: ${err}`);
    });
}

export function zip() {
  let appPath = fs.knownFolders.currentApp().path;
  let testZipFile = fs.path.join(appPath, 'toZip');
  // Zip.unzip(testZipFile, appPath);
  console.log(`zipping ${testZipFile} into ${destZip.path}`);
  Zip.zip({
    destination:destZip.path,
    folderToArchive:testZipFile,
    progressCallback:onZipProgress,
    keepParentDirectory:false
  })
    .then(() => {
      console.log(`zip succesfully completed: ${destZip.path}`);
    })
    .catch((err) => {
      console.log(`zip error: ${err}`);
    });
}

export function showFiles() {
    traceFolderTree(dest, 2);
}

function onZipProgress(percent: number) {
    console.log(`unzip progress: ${percent}`);
    model.progress = percent;
    model.notifyPropertyChange('progress', percent);
}

function traceFolderTree(folder: fs.Folder, maxDepth: number = 3, depth: number = 0) {
  try {
    let whitespace = new Array(depth + 1).join('  ');
    console.log(`${whitespace}${fs.Folder.fromPath(folder.path).name}`);
    folder.eachEntity((ent) => {
      if (fs.Folder.exists(ent.path) && depth < maxDepth) {
        traceFolderTree(fs.Folder.fromPath(ent.path), maxDepth, depth + 1);
      } else {
        console.log(`${whitespace}- ${ent.name}`);
      }
      return true;
    });
  } catch(err) {
    console.log(`err tracing tree: ${err}`);
  }
}