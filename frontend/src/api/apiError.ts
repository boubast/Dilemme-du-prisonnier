type RhaiScriptError = {
  error_type: "rhai_script_error"
  strategy_name: string
  iteration: number
  message: string
}

type PydanticValidationError = {
  msg: string
  [key: string]: unknown
}

type ApiErrorInfo = {
  detail?: string | RhaiScriptError | PydanticValidationError[]
  [key: string]: unknown
}

export class ApiError extends Error {
  readonly status: number
  readonly info?: ApiErrorInfo

  constructor(message: string, status: number, info?: ApiErrorInfo) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.info = info
    Object.setPrototypeOf(this, ApiError.prototype)
  }

  get friendlyMessage(): string {
    const detail = this.info?.detail

    if (detail === undefined || detail === null) return this.message

    if (typeof detail === "string") return detail

    if (isRhaiScriptError(detail)) {
      return detail.message
    }

    if (Array.isArray(detail)) {
      return detail.map((err) => err.msg ?? JSON.stringify(err)).join(", ")
    }

    return this.message
  }
}

function isRhaiScriptError(value: unknown): value is RhaiScriptError {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as RhaiScriptError).error_type === "rhai_script_error"
  )
}

async function parseErrorBody(
  response: Response
): Promise<{ message: string; info: ApiErrorInfo }> {
  const contentType = response.headers.get("content-type") ?? ""

  if (!contentType.includes("application/json")) {
    const text = await response.text().catch(() => "")
    return { message: text || response.statusText, info: {} }
  }

  const info: ApiErrorInfo = await response.json().catch(() => ({}))
  const detail = info.detail

  if (typeof detail === "string") return { message: detail, info }

  if (isRhaiScriptError(detail)) return { message: detail.message, info }

  if (Array.isArray(detail)) {
    return {
      message: detail.map((err) => err.msg).join(", "),
      info,
    }
  }

  return { message: response.statusText, info }
}

export async function handleApiResponseError(
  response: Response,
  defaultMessage: string
): Promise<ApiError> {
  const { message, info } = await parseErrorBody(response).catch(() => ({
    message: defaultMessage,
    info: {},
  }))

  return new ApiError(message || defaultMessage, response.status, info)
}
