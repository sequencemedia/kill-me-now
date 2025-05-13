#!/usr/bin/env node

import debug from 'debug'

const {
  env: {
    DEBUG = 'kill-me-now,kill-me-now:error'
  }
} = process

if (DEBUG) debug.enable(DEBUG)

export default debug
