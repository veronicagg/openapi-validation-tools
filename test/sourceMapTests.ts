// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

import { validateExamples } from "../lib/validate"
import * as assert from "assert"

describe("sourceMap", () => {
  it("INVALID_TYPE", async () => {
    const file =
      // tslint:disable-next-line:max-line-length
      "./test/modelValidation/swaggers/specification/source-map/Microsoft.ADHybridHealthService/stable/2014-01-01/ADHybridHealthService.json"
    const result = await validateExamples(
      file,
      undefined,
      {
        consoleLogLevel: "off"
      }
    )
    assert.strictEqual(result.length, 1)
    const result0 = result[0]
    const e = result0.errorDetails as any
    assert.strictEqual(e.url, file)
    assert.deepStrictEqual(e.position, { line: 76, column: 11 })
  })
})
