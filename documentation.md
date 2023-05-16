# Overall workflow for the app:

### Connecting postgreSQL:

- local postgreSQL:

1. setup postgreSQL in local machine and start the server
2. for local database server the URI is something like "postgresql://postgres@localhost:5432/node_db_oauth"
3. run migration command to create tables

- Using supabase:

1. create supabase account
2. setup a project
3. on the database page copy the URI of the database
4. run migration command to create tables
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
