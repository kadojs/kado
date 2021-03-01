# FileSystem
*Introduced in 4.0.0*
> Stability: 2 Stable
```js
const FileSystem = require('kado/lib/FileSystem')
```
The `FileSystem` library provides a clean consistent overlay on top of the core
file system functions. This library provides promises as a standard method
of resolution.

#### Motivations

The core file system methods are amazing, however, they are restricted by
meeting the demands of legacy software. This library is mostly a wrapper but
helps to make a more consistent and existential API.

This is done by promoting the fs.promises API to primary, then merging
the sync APIs and utility methods into the primary. The end result is a clean
ES6+ fs module with all the core functions. This provides a more intuitive API
and cleaner usage.

## Class: FileSystem

This class is based on Node.js File System module, see
[this documentation](https://nodejs.org/api/fs.html)
for instructions using these methods. Otherwise, see the document for the
Node.js version you are using such as:
[v10.x](https://nodejs.org/dist/latest-v10.x/docs/api/fs.html) or
[v12.x](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html), etc

NOTE: All methods are static.

Usage:
```js
const fs = require('kado/lib/FileSystem')
fs.appendFile('some/file.txt', 'some data to append')
  .then(() => { console.log('ok') })
const rv = fs.exists('some/file')
console.log(rv) //false
```

Usage can be referenced on the corresponding Node.js documentation,
linked below.

## Available properties

### FileSystem.Stats
This is a convenience reference to the core
[Stats class](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_class_fs_stats)
and is sometimes used for type checking as `instanceof fs.Stats`

### FileSystem.Dirent
This is a convenience reference to the core
[Dirent class](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_class_fs_dirent)
and is sometimes used for type checking as `instanceof fs.Dirent`

### FileSystem.path
This is a convenience reference to the core
[path module](https://nodejs.org/dist/latest-v12.x/docs/api/path.html)

## Available methods

### FileSystem.access(path, mode)
Refer to [fsPromises.access](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_access_path_mode)

### FileSystem.accessSync(path, mode)
Refer to [fs.accessSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_accesssync_path_mode)

### FileSystem.appendFile(path, data, options)
Refer to [fsPromises.appendFile](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_appendfile_path_data_options)

### FileSystem.appendFileSync(path, data, options)
Refer to [fs.appendFileSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_appendfilesync_path_data_options)

### FileSystem.chmod(path, mode)
Refer to [fsPromises.chmod](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_chmod_path_mode)

### FileSystem.chmodSync(path, mode)
Refer to [fs.chmodSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_chmodsync_path_mode)

### FileSystem.chown(path, uid, gid)
Refer to [fsPromises.chown](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_chown_path_uid_gid)

### FileSystem.chownSync(path, uid, gid)
Refer to [fs.chownSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_chownsync_path_uid_gid)

### FileSystem.closeSync(fd)
Refer to [fs.closeSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_closesync_fd)

### FileSystem.copyFile(src, dest, flags)
Refer to [fsPromises.copyFile](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_copyfile_src_dest_flags)

### FileSystem.copyFileSync(src, dest, flags)
Refer to [fs.copyFileSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_copyfilesync_src_dest_flags)

### FileSystem.createReadStream(path, options)
Refer to [fs.createReadStream](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_createreadstream_path_options)

### FileSystem.createWriteStream(path, options)
Refer to [fs.createWriteStream](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_createwritestream_path_options)

### FileSystem.exists(path)
Refer to [fs.existsSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_existssync_path)

### FileSystem.fchmodSync(fd, mode)
Refer to [fs.fchmodSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_fchmodsync_fd_mode)

### FileSystem.fchownSync(fd, mode)
Refer to [fs.fchownSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_fchownsync_fd_uid_gid)

### FileSystem.fdatasyncSync(fd)
Refer to [fs.fdatasyncSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_fdatasyncsync_fd)

### FileSystem.fsyncSync(fd)
Refer to [fs.fsyncSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_fstatsync_fd_options)

### FileSystem.ftruncateSync(fd)
Refer to [fs.ftruncateSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_ftruncatesync_fd_len)

### FileSystem.futimesSync(fd, atime, mtime)
Refer to [fs.futimesSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_futimessync_fd_atime_mtime)

### FileSystem.gunzipFile (path, options)
* `path` {string} path to the file to unzip using gzip
* `options` {Object} options passed to zlib.createGunzip()
* Return {Promise} resolved with destination file path

### FileSystem.gzipFile (path, options)
* `path` {string} path to the file to zip using gzip
* `options` {Object} options passed to zlib.createGzip()
* Return {Promise} resolved with destination file path

### FileSystem.lchmod(path, mode)
Refer to [fsPromises.lchmod](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_lchmod_path_mode)

### FileSystem.lchmodSync(path, mode)
Refer to [fs.lchmodSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_lchmodsync_path_mode)

### FileSystem.lchown(path, uid, gid)
Refer to [fsPromises.lchown](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_lchown_path_uid_gid)

### FileSystem.lchownSync(path, uid, gid)
Refer to [fs.lchownSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_lchownsync_path_uid_gid)

### FileSystem.link(existingPath, newPath)
Refer to [fsPromises.link](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_link_existingpath_newpath)

### FileSystem.linkSync(existingPath, newPath)
Refer to [fs.linkSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_linksync_existingpath_newpath)

### FileSystem.lstat(path, options)
Refer to [fsPromises.lstat](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_lstat_path_options)

### FileSystem.lstatSync(path, options)
Refer to [fs.lstatSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_lstatsync_path_options)

### FileSystem.mkdir(path, options)
Refer to [fsPromises.mkdir](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_mkdir_path_options)

### FileSystem.mkdirSync(path, options)
Refer to [fs.mkdirSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_mkdirsync_path_options)

### FileSystem.mkdtemp(prefix, options)
Refer to [fsPromises.mkdtemp](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_mkdtemp_prefix_options)

### FileSystem.mkdtempSync(prefix, options)
Refer to [fs.mkdtempSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_mkdtempsync_prefix_options)

### FileSystem.open(path, flags, mode)
Refer to [fsPromises.open](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_open_path_flags_mode)

### FileSystem.opendir(path, options)
Refer to [fsPromises.opendir](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_opendir_path_options)

### FileSystem.opendirSync(path, options)
Refer to [fs.opendirSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_opendirsync_path_options)

### FileSystem.openSync(path, flags, mode)
Refer to [fs.openSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_opensync_path_flags_mode)

### FileSystem.readdir(path, options)
Refer to [fsPromises.readdir](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_readdir_path_options)

### FileSystem.readdirSync(path, options)
Refer to [fs.readdirSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_readdirsync_path_options)

### FileSystem.readFile(path, options)
Refer to [fsPromises.readFile](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_readfile_path_options)

### FileSystem.readFileSync(path, options)
Refer to [fs.readFileSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_readfilesync_path_options)

### FileSystem.readlink(path, options)
Refer to [fsPromises.readlink](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_readlink_path_options)

### FileSystem.readlinkSync(path, options)
Refer to [fs.readlinkSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_readlinksync_path_options)

### FileSystem.readSync(fd, buffer, offset, length, position)
Refer to [fs.readSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_readsync_fd_buffer_offset_length_position)

### FileSystem.realpath(path, options)
Refer to [fsPromises.realpath](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_realpath_path_options)

### FileSystem.realpathSync(path, options)
Refer to [fs.realpathSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_realpathsync_path_options)

### FileSystem.rename(oldPath, newPath)
Refer to [fsPromises.rename](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_rename_oldpath_newpath)

### FileSystem.renameSync(oldPath, newPath)
Refer to [fs.renameSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_renamesync_oldpath_newpath)

### FileSystem.rmdir(path, options)
Refer to [fsPromises.rmdir](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_rmdir_path_options)

### FileSystem.rmdirSync(path, options)
Refer to [fs.rmdirSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_rmdirsync_path_options)

### FileSystem.stat(path, options)
Refer to [fsPromises.stat](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_stat_path_options)

### FileSystem.statSync(path, options)
Refer to [fs.statSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_statsync_path_options)

### FileSystem.symlink(target, path, type)
Refer to [fsPromises.symlink](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_symlink_target_path_type)

### FileSystem.symlinkSync(target, path, type)
Refer to [fs.symlinkSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_symlinksync_target_path_type)

### FileSystem.truncate(path, len)
Refer to [fsPromises.truncate](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_truncate_path_len)

### FileSystem.truncateSync(path, len)
Refer to [fs.truncateSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_truncatesync_path_len)

### FileSystem.unlink(path)
Refer to [fsPromises.unlink](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_unlink_path)

### FileSystem.unlinkSync(path)
Refer to [fs.unlinkSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_unlinksync_path)

### FileSystem.unwatchFile(filename, listener)
Refer to [fs.unwatchFile](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_unwatchfile_filename_listener)

### FileSystem.utimes(path, atime, mtime)
Refer to [fsPromises.utimes](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_utimes_path_atime_mtime)

### FileSystem.utimesSync(path, atime, mtime)
Refer to [fs.utimesSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_utimessync_path_atime_mtime)

### FileSystem.watch(filename, options, listener)
Refer to [fs.watch](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_watch_filename_options_listener)

### FileSystem.watchFile(filename, options, listener)
Refer to [fs.watchFile](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_watchfile_filename_options_listener)

### FileSystem.writeFile(file, data, options)
Refer to [fsPromises.writeFile](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fspromises_writefile_file_data_options)

### FileSystem.writeFileSync(file, data, options)
Refer to [fs.writeFileSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_writefilesync_file_data_options)

### FileSystem.writeSync(fd, buffer, offset, length, position)
Refer to [fs.writeSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_writesync_fd_buffer_offset_length_position)

### FileSystem.writeSync(fd, string, position, encoding)
Refer to [fs.writeSync](https://nodejs.org/dist/latest-v12.x/docs/api/fs.html#fs_fs_writesync_fd_string_position_encoding)
