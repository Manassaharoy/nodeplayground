const HttpErrors = {
  400: {
    code: 400,
    message: "Bad Request",
  },
  401: {
    code: 401,
    message: "Unauthorized",
  },
  402: {
    "code": 402,
    "message": "Payment Required"
  },
  403: {
    code: 403,
    message: "Forbidden",
  },
  404: {
    code: 404,
    message: "Not Found",
  },
  405: {
    code: 405,
    message: "Method Not Allowed",
  },
  406: {
    code: 406,
    message: "Not Acceptable",
  },
  407: {
    code: 407,
    message: "Proxy Authentication Required",
  },
  408: {
    code: 408,
    message: "Request Timeout",
  },
  409: {
    code: 409,
    message: "Conflict",
  },
  410: {
    code: 410,
    message: "Gone",
  },
  411: {
    code: 411,
    message: "Length Required",
  },
  412: {
    code: 412,
    message: "Precondition Failed",
  },
  413: {
    code: 413,
    message: "Request Entity Too Large",
  },
  414: {
    code: 414,
    message: "Request-URI Too Long",
  },
  415: {
    code: 415,
    message: "Unsupported Media Type",
  },
  416: {
    code: 416,
    message: "Requested Range Not Satisfiable",
  },
  417: {
    code: 417,
    message: "Expectation Failed",
  },
  418: {
    code: 418,
    message: "I'm a teapot",
  },
  420: {
    code: 420,
    message: "Enhance Your Calm",
  },
  422: {
    code: 422,
    message: "Unprocessable Entity",
  },
  423: {
    code: 423,
    message: "Locked",
  },
  424: {
    code: 424,
    message: "Failed Dependency",
  },
  425: {
    code: 425,
    message: "Reserved for WebDAV",
  },
  426: {
    code: 426,
    message: "Upgrade Required",
  },
  428: {
    code: 428,
    message: "Precondition Required",
  },
  429: {
    code: 429,
    message: "Too Many Requests",
  },
  431: {
    code: 431,
    message: "Request Header Fields Too Large",
  },
  444: {
    code: 444,
    message: "No Response",
  },
  449: {
    code: 449,
    message: "Retry With",
  },
  450: {
    code: 450,
    message: "Blocked by Windows Parental Controls",
  },
  451: {
    code: 451,
    message: "Unavailable For Legal Reasons",
  },
  499: {
    code: 499,
    message: "Client Closed Request",
  },
  500: {
    code: 500,
    message: "Internal Server Error",
  },
  503: {
    code: 503,
    message: "Service Unavailable",
  },
};

module.exports = HttpErrors;
