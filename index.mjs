#!/usr/bin/env node

import debug from 'debug'

import {
  getLsofArray
} from '@sequencemedia/lsof'

const {
  env: {
    DEBUG = 'kill-me-now,kill-me-now:error'
  }
} = process

if (DEBUG) debug.enable(DEBUG)

const log = debug('kill-me-now')
const info = debug('kill-me-now:info')
const error = debug('kill-me-now:error')

log('`kill-me-now` is awake')

/**
 *  @param {string} alpha
 *  @returns {(openFile: Record<string, string>) => boolean}
 */
function getHasName (alpha) {
  info('getHasName')

  /**
   *  @param {Record<string, string>} openFile
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
 *  @returns {(openFile: Record<string, string>) => boolean}
 */
function getHasPid (alpha) {
  info('getHasPid')

  if (alpha) {
    return function hasPid ({ pid: omega }) {
      info('hasPid')

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
 *  @returns {(openFile: Record<string, string>) => boolean}
 */
function getHasCmd (alpha) {
  info('getHasCmd')

  if (alpha) {
    return function hasCmd ({ cmd: omega }) {
      info('hasCmd')

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
 *  @param {Record<string, string>} openFile
 *  @returns {void}
 */
function killProcess ({ pid }) {
  info('killProcess')

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
 *  @param {string} name
 *  @param {number} [pid] Process ID
 *  @param {string} [cmd] Command
 *  @returns {Promise<void>}
 */
export default async function killMeNow (name, pid, cmd) {
  const lsof = await getLsofArray()
  const hasName = getHasName(name)

  if (lsof.some(hasName)) {
    lsof
      .filter(hasName)
      .filter(getHasPid(pid))
      .filter(getHasCmd(cmd))
      .forEach(killProcess)
  }
}
