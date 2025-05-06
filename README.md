# Kill Me Now

Find and kill application processes by _file path_

```bash
npm i -P kill-me-now
```

## Parameters

- A `name` (which is the _file path_) to identify application processes is _required_
- A `pid` to *exclude* is _optional_
- And a `cmd` is _optional_

## Example

Import `killMeNow`

```javascript
import killMeNow from 'kill-me-now'
```

Kill all processes on _this path_

```javascript
/**
 *  Get the current working directory
 */
const cwd = process.cwd()

await killMeNow(cwd)
```

(This will include the current process represented by `process`)

Kill any processes on _this path_ except for _the current process_

```javascript
/**
 *  Get the current working directory
 */
const cwd = process.cwd()
/**
 *  Get the current process ID
 */
const pid = process.pid

await killMeNow(cwd, pid)
```
