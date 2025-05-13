#!/usr/bin/env node

/**
 *  @typedef {{ name: string, pid: number, command: string }} OpenFileType
 */

import {
  getLsofArray
} from '@sequencemedia/lsof'

import debug from './debug.mjs'

const log = debug('kill-me-now')
const info = debug('kill-me-now:info')
const error = debug('kill-me-now:error')

log('`kill-me-now` is awake')

/**
 *  @param {string} alpha
 *  @returns {(openFile: OpenFileType) => boolean}
 */
function getHasName (alpha) {
  info('getHasName')

  /**
   *  @param {OpenFileType} openFile
   *  @returns {boolean}
   */
  return function hasName ({ name: omega }) {
    info('hasName')

    return (
      omega.startsWith(alpha)
    )
  }
}

/**
 *  @param {number} alpha
 *  @returns {(openFile: OpenFileType) => boolean}
 */
function getHasProcessId (alpha) {
  info('getHasProcessId')

  if (alpha) {
    return function hasProcessId ({ pid: omega }) {
      info('hasProcessId')

      return (
        omega !== alpha
      )
    }
  }

  return function filter () {
    return true
  }
}

/**
 *  @param {string} alpha
 *  @returns {(openFile: OpenFileType) => boolean}
 */
function getHasCommand (alpha) {
  info('getHasCommand')

  if (alpha) {
    return function hasCommand ({ command: omega }) {
      info('hasCommand')

      return (
        omega === alpha
      )
    }
  }

  return function filter () {
    return true
  }
}

/**
 *  @param {{ pid: number }} openFile
 *  @returns {void}
 */
function killProcessById ({ pid }) {
  info('killProcessById')

  try {
    log(`Killing process ${pid} ...`)

    process.kill(pid)

    log(`Killing process ${pid} succeeded.`)
  } catch (e) {
    const {
      code
    } = e

    if (code !== 'ESRCH') error(e)

    error(`Killing process ${pid} failed.`)
  }
}

/**
 *  @param {string} name Name or File Path
 *  @param {number} [pid] Process ID
 *  @param {string} [command] Command
 *  @returns {Promise<void>}
 */
export default async function killMeNow (name, pid, command) {
  const lsof = await getLsofArray()
  const hasName = getHasName(name)

  if (lsof.some(hasName)) {
    lsof
      .filter(hasName)
      .filter(getHasProcessId(pid))
      .filter(getHasCommand(command))
      .forEach(killProcessById)
  }
}
