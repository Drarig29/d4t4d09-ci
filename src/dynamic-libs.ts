import * as core from '@drarig29/d4t4d09-ci-core'
import chalk from 'chalk'
import * as clipanion from 'clipanion'
import * as semver from 'semver'
import * as typanion from 'typanion'

// https://github.com/yarnpkg/berry/blob/daa574791b3b2df01e76c1fdfd9c975050a0fb9d/packages/yarnpkg-cli/sources/tools/getDynamicLibs.ts

export const getDynamicLibs = () =>
  new Map<string, any>([
    [`@drarig29/d4t4d09-ci-core`, core],

    // Those ones are always useful
    [`clipanion`, clipanion],
    [`chalk`, chalk],
    [`semver`, semver],
    [`typanion`, typanion],
  ])
