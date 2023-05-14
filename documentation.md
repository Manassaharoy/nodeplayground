# Overall workflow for the app:

### Admin management

- login:
  <br/>
  <b>isAdminCheckBeforeLogin</b> - to check the role of the requested user is "admin" or not.
  <br/>
  isValidAdmin - validation checking for the user informations given in body
  <br/>
  adminLoginHandler - the login function

- logout:
  <br/>
  <b>isAdminCheckAfterLogin</b> - to get the userid from access token and then checking he user role is "admin" or not
  <br/>
  <b>adminLogoutHandler</b> - the logout function

<br/>
