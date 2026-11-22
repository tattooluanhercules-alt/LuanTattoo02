/**
 * DriveService.gs — Organização de pastas, listagem, upload, renomeação e exclusão segura no Google Drive
 */

var ALLOWED_UPLOAD_MIMES = {
  'image/jpeg': 5 * 1024 * 1024,
  'image/png': 5 * 1024 * 1024,
  'image/webp': 5 * 1024 * 1024,
  'image/avif': 5 * 1024 * 1024,
  'audio/mpeg': 15 * 1024 * 1024,
  'audio/mp3': 15 * 1024 * 1024,
  'audio/wav': 15 * 1024 * 1024,
  'audio/ogg': 15 * 1024 * 1024,
  'audio/mp4': 15 * 1024 * 1024,
  'video/mp4': 25 * 1024 * 1024,
  'video/webm': 25 * 1024 * 1024,
  'application/pdf': 10 * 1024 * 1024
};

function getRootFolder_(rootFolderId) {
  return DriveApp.getFolderById(rootFolderId);
}

function ensureDriveFolders_(rootFolderId) {
  var root = getRootFolder_(rootFolderId);
  var existingMap = {};
  var folders = root.getFolders();
  while (folders.hasNext()) {
    var f = folders.next();
    existingMap[f.getName()] = f;
  }

  var result = [];
  for (var i = 0; i < DRIVE_FOLDERS.length; i++) {
    var name = DRIVE_FOLDERS[i];
    var folder = existingMap[name] || root.createFolder(name);
    result.push({ name: name, id: folder.getId(), folder: folder });
  }
  return result;
}

function findSubfolderByName_(rootFolderId, folderName) {
  if (DRIVE_FOLDERS.indexOf(folderName) === -1) {
    throw new Error('Nome de pasta não permitido: ' + folderName);
  }
  var list = ensureDriveFolders_(rootFolderId);
  for (var i = 0; i < list.length; i++) {
    if (list[i].name === folderName) {
      return list[i].folder;
    }
  }
  throw new Error('Pasta não encontrada: ' + folderName);
}

function isFileInsideRoot_(file, rootFolderId) {
  var parents = file.getParents();
  while (parents.hasNext()) {
    var parent = parents.next();
    if (parent.getId() === rootFolderId) return true;
    var grandParents = parent.getParents();
    while (grandParents.hasNext()) {
      if (grandParents.next().getId() === rootFolderId) return true;
    }
  }
  return false;
}

function listFoldersService_(rootFolderId) {
  var ensured = ensureDriveFolders_(rootFolderId);
  var output = [];
  for (var i = 0; i < ensured.length; i++) {
    var item = ensured[i];
    var count = 0;
    var files = item.folder.getFiles();
    while (files.hasNext()) {
      files.next();
      count++;
    }
    output.push({
      name: item.name,
      id: item.id,
      fileCount: count
    });
  }
  return output;
}

function listFilesService_(rootFolderId, folderNameFilter, sheetId) {
  var ensured = ensureDriveFolders_(rootFolderId);
  var bindings = readMidiasBindingsMap_(sheetId);
  var filesOutput = [];
  var foldersOutput = [];

  for (var i = 0; i < ensured.length; i++) {
    var entry = ensured[i];
    var fileCount = 0;
    var files = entry.folder.getFiles();
    while (files.hasNext()) {
      var file = files.next();
      fileCount++;
      if (folderNameFilter && entry.name !== folderNameFilter) {
        continue;
      }
      var fid = file.getId();
      filesOutput.push({
        id: fid,
        name: file.getName(),
        mimeType: file.getMimeType(),
        sizeBytes: file.getSize(),
        folderName: entry.name,
        folderId: entry.id,
        publicUrl: '/api/media/' + fid,
        thumbnailUrl: file.getMimeType().indexOf('image/') === 0 ? '/api/media/' + fid : '',
        sectionBinding: bindings[fid] || '',
        createdAt: Utilities.formatDate(file.getDateCreated(), STUDIO_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"),
        updatedAt: Utilities.formatDate(file.getLastUpdated(), STUDIO_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX")
      });
    }
    foldersOutput.push({
      name: entry.name,
      id: entry.id,
      fileCount: fileCount
    });
  }

  return { files: filesOutput, folders: foldersOutput };
}

function getFileService_(rootFolderId, payload) {
  var err = validateRequired_(payload, ['fileId']);
  if (err) throw new Error(err);

  var file = DriveApp.getFileById(String(payload.fileId));
  if (!isFileInsideRoot_(file, rootFolderId)) {
    throw new Error('Acesso negado: arquivo fora da pasta principal do estúdio.');
  }

  var result = {
    id: file.getId(),
    name: file.getName(),
    mimeType: file.getMimeType(),
    sizeBytes: file.getSize()
  };

  if (payload.includeContent) {
    var bytes = file.getBlob().getBytes();
    result.base64 = Utilities.base64Encode(bytes);
  }
  return result;
}

function uploadFileService_(rootFolderId, sheetId, payload) {
  var err = validateRequired_(payload, ['name', 'mimeType', 'base64Content', 'folderName']);
  if (err) throw new Error(err);

  var mimeType = String(payload.mimeType);
  var maxBytes = ALLOWED_UPLOAD_MIMES[mimeType];
  if (!maxBytes) {
    throw new Error('Tipo de arquivo não permitido: ' + mimeType);
  }

  var rawB64 = String(payload.base64Content);
  if (rawB64.indexOf(',') !== -1) {
    rawB64 = rawB64.split(',')[1];
  }

  var decoded = Utilities.base64Decode(rawB64);
  if (decoded.length === 0 || decoded.length > maxBytes) {
    throw new Error('Tamanho do arquivo inválido ou acima do limite permitido.');
  }

  var safeName = String(payload.name).replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 120);
  var folder = findSubfolderByName_(rootFolderId, String(payload.folderName));
  var blob = Utilities.newBlob(decoded, mimeType, safeName);
  var created = folder.createFile(blob);

  var now = nowMaceioIso_();
  var record = {
    id: created.getId(),
    name: created.getName(),
    mimeType: created.getMimeType(),
    sizeBytes: created.getSize(),
    folderName: String(payload.folderName),
    folderId: folder.getId(),
    publicUrl: '/api/media/' + created.getId(),
    thumbnailUrl: mimeType.indexOf('image/') === 0 ? '/api/media/' + created.getId() : '',
    sectionBinding: String(payload.sectionBinding || ''),
    createdAt: now,
    updatedAt: now
  };

  upsertMidiaRow_(sheetId, record);
  return { file: record };
}

function renameFileService_(rootFolderId, sheetId, payload) {
  var err = validateRequired_(payload, ['fileId']);
  if (err) throw new Error(err);

  var file = DriveApp.getFileById(String(payload.fileId));
  if (!isFileInsideRoot_(file, rootFolderId)) {
    throw new Error('Acesso negado: arquivo fora da pasta do estúdio.');
  }

  if (payload.newName) {
    var safeName = String(payload.newName).replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 120);
    file.setName(safeName);
  }

  updateMidiaRow_(sheetId, file.getId(), file.getName(), payload.sectionBinding);

  return {
    file: {
      id: file.getId(),
      name: file.getName(),
      mimeType: file.getMimeType(),
      sizeBytes: file.getSize(),
      sectionBinding: payload.sectionBinding || '',
      updatedAt: nowMaceioIso_()
    }
  };
}

function deleteFileService_(rootFolderId, sheetId, payload) {
  var err = validateRequired_(payload, ['fileId']);
  if (err) throw new Error(err);
  if (payload.confirm !== true) {
    throw new Error('Confirmação explícita obrigatória para excluir o arquivo.');
  }

  var file = DriveApp.getFileById(String(payload.fileId));
  if (!isFileInsideRoot_(file, rootFolderId)) {
    throw new Error('Acesso negado: arquivo fora da pasta do estúdio.');
  }

  file.setTrashed(true);
  removeMidiaRow_(sheetId, file.getId());
  return { deletedId: file.getId() };
}

function createFolderService_(rootFolderId, payload) {
  var err = validateRequired_(payload, ['folderName']);
  if (err) throw new Error(err);
  var folder = findSubfolderByName_(rootFolderId, String(payload.folderName));
  return { id: folder.getId(), name: folder.getName() };
}
