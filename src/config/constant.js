
// General Error Messages
const ERROR_MESSAGE_INVALID_REQUEST = "Invalid request, please check the data sent.";
const ERROR_MESSAGE_USER_NOT_FOUND = "The requested user was not found.";
const ERROR_MESSAGE_SERVER = "Internal server error. Please try again later.";

// Authentication & Authorization
const ERROR_MESSAGE_INVALID_CREDENTIALS = "Invalid username or password.";
const ERROR_MESSAGE_UNAUTHORIZED = "You are not authorized to perform this action.";
const ERROR_MESSAGE_PERMISSION_DENIED = "You do not have permission to access this resource.";


// Validation Errors
const ERROR_MESSAGE_REQUIRED_FIELD = "This field is required.";
const ERROR_MESSAGE_INVALID_EMAIL = "Please provide a valid email address.";
const ERROR_MESSAGE_MIN_LENGTH = "The input must be at least {min} characters long.";
const ERROR_MESSAGE_MAX_LENGTH = "The input must be no more than {max} characters long.";


// Success Messages
const SUCCESS_MESSAGE_CREATED = "Resource successfully created.";
const SUCCESS_MESSAGE_UPDATED = "Resource successfully updated.";
const SUCCESS_MESSAGE_DELETED = "Resource successfully deleted.";
const SUCCESS_MESSAGE_LOGGED_IN = "You have successfully logged in.";


// HTTP Status Codes
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_CREATED = 201;
const HTTP_STATUS_BAD_REQUEST = 400;
const HTTP_STATUS_UNAUTHORIZED = 401;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_INTERNAL_ERROR = 500;


//jwt token
const JWT_EXPIRATION_TIME = '120d';
const TOKEN_OPTIONS = {
  algorithm: "HS256",   // HMAC SHA256 Algorithm
  expiresIn: JWT_EXPIRATION_TIME,      // Token expires in 1 hour
  issuer: "DOW-SUPERADMIN", // Token issuer
  audience: "DOW-USERS" // Intended audience
};



//roles of the user
const questionTypes={
  1:"Open Question",
  2:"Multiple Answer Question",
  3:"Single Answer Question"
};
const roles={
  1:"Staff",
  2:"Super Admin"
};



module.exports = {
  ERROR_MESSAGE_INVALID_REQUEST,
  ERROR_MESSAGE_USER_NOT_FOUND,
  ERROR_MESSAGE_SERVER,
  ERROR_MESSAGE_INVALID_CREDENTIALS,
  ERROR_MESSAGE_UNAUTHORIZED,
  ERROR_MESSAGE_PERMISSION_DENIED,
  ERROR_MESSAGE_REQUIRED_FIELD,
  ERROR_MESSAGE_INVALID_EMAIL,
  ERROR_MESSAGE_MIN_LENGTH,
  ERROR_MESSAGE_MAX_LENGTH,
  SUCCESS_MESSAGE_CREATED,
  SUCCESS_MESSAGE_UPDATED,
  SUCCESS_MESSAGE_DELETED,
  SUCCESS_MESSAGE_LOGGED_IN,
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_UNAUTHORIZED,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_ERROR,


  JWT_EXPIRATION_TIME,
  TOKEN_OPTIONS,
  questionTypes,
  roles
};


