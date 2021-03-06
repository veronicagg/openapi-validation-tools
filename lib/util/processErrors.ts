// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

import { NodeError } from "./validationError"
import { isArray, filterMap } from "@ts-common/iterator"
import { jsonSymbol } from "z-schema"
import { getInfo, getRootObjectInfo, getAllDirectives } from '@ts-common/source-map'
import { TitleObject } from '../validators/specTransformer'
import { log } from './logging'
import { getDescendantFilePosition } from "@ts-common/source-map"
import { setMutableProperty } from "@ts-common/property-set"
import { merge } from "@ts-common/string-map"

export const processErrors = <T extends NodeError<T>>(errors: T[] | undefined): T[] | undefined =>
  createErrorProcessor<T>()(errors)

const addFileInfo = <T extends NodeError<T>>(error: T): T => {
  const title = error.title
  if (title !== undefined) {
    try {
      const titleObject: TitleObject | undefined = JSON.parse(title)
      if (titleObject !== undefined) {
        const { path } = titleObject
        error.position = titleObject.position
        error.url = titleObject.url
        if (path !== undefined) {
          error.title = "/" + path.join("/")
        }
        error.directives = titleObject.directives
      }
    // tslint:disable-next-line:no-empty
    } catch {
      log.error(`ICE: can't parse title: ${title}`)
    }
  }
  const json = error[jsonSymbol]
  if (json !== undefined) {
    const jsonInfo = getInfo(json)
    if (jsonInfo !== undefined) {
      const errorPathOriginal = error.path
      const errorPath = errorPathOriginal === undefined ? undefined :
        isArray(errorPathOriginal) ? errorPathOriginal :
        errorPathOriginal.split("/")
      setMutableProperty(
        error,
        "jsonPosition",
        getDescendantFilePosition(json, errorPath)
      )
      error.directives = merge(error.directives, getAllDirectives(json, errorPath))
      error.jsonUrl = getRootObjectInfo(jsonInfo).url
    }
  }
  return error
}

const createErrorProcessor = <T extends NodeError<T>>() => {

  const isSuppressed = (error: T): boolean =>
    error.directives !== undefined &&
    error.code !== undefined &&
    error.directives[error.code] !== undefined

  const one = (error: T): T | undefined => {
    error = addFileInfo(error)
    if (isSuppressed(error)) {
      return undefined
    }
    setMutableProperty(error, "errors", multiple(error.errors))
    setMutableProperty(error, "inner", multiple(error.inner))
    return error
  }

  const multiple = (errors: T[] | undefined) =>
    errors === undefined ? undefined : Array.from(filterMap(errors, one))

  return multiple
}
