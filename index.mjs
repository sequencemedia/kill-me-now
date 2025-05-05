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
 *  @param {string} filePath
 *  @returns {(openFile: Record<string, string>) => boolean}
 */
function getHasOpenFiles (filePath) {
  info('getHasOpenFiles')

  /**
   *  @param {Record<string, string>} openFile
   *  @returns {boolean}
   */
  function hasFilePath ({ 'FILE PATH': FILEPATH }) {
    info('hasFilePath')

    return (
      FILEPATH.startsWith(filePath)
    )
  }

  /**
   *  @param {Array<Record<string, string>>} openFiles
   *  @returns {boolean}
   */
  return function hasOpenFiles (openFiles) {
    info('hasOpenFiles')

    return (
      openFiles.some(hasFilePath)
    )
  }
}

/**
 *  @param {string} filePath
 *  @returns {(openFile: Record<string, string>) => boolean}
 */
function getFilterForFilePath (filePath) {
  info('getFilterForFilePath')

  /**
   *  @param {Record<string, string>} openFile
   *  @returns {boolean}
   */
  return function filterForFilePath ({ 'FILE PATH': FILEPATH }) {
    info('filterForFilePath')

    return (
      FILEPATH.startsWith(filePath)
    )
  }
}

/**
 *  @param {number} process
 *  @returns {(openFile: Record<string, string>) => boolean}
 */
function getFilterForProcess (process) {
  info('getFilterForProcess')

  if (process) {
    return function filterForProcess ({ PROCESS }) {
      info('filterForProcess')

      return (
        PROCESS !== process
      )
    }
  }

  return function filter () {
    return true
  }
}

/**
 *  @param {string} command
 *  @returns {(openFile: Record<string, string>) => boolean}
 */
function getFilterForCommand (command) {
  info('getFilterForCommand')

  if (command) {
    return function filterForCommand ({ COMMAND }) {
      info('filterForCommand')

      return (
        COMMAND === command
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
function forEach ({ PROCESS }) {
  info('forEach')

  try {
    log(`Killing process ${PROCESS} ...`)

    process.kill(PROCESS)

    log(`Killing process ${PROCESS} succeeded.`)
  } catch (e) {
    const {
      code
    } = e

    if (code !== 'ESRCH') error(e)

    error(`Killing process ${PROCESS} failed.`)
  }
}

/**
 *  @param {string} filePath
 *  @param {number} [process] Process ID
 *  @param {string} [command] Command
 *  @returns {Promise<void>}
 */
export default async function killMeNow (filePath, process, command) {
  const lsof = await getLsofArray()
  const hasOpenFiles = getHasOpenFiles(filePath)

  if (lsof.some(hasOpenFiles)) {
    const forFilePath = getFilterForFilePath(filePath)
    const forProcess = getFilterForProcess(process)
    const forCommand = getFilterForCommand(command)

    lsof.flat()
      .filter(forFilePath)
      .filter(forProcess)
      .filter(forCommand)
      .forEach(forEach)
  }
}
