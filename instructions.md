# ENV FILE:

The env file must contain bellow values:

```
MONGO_DATABASE_URL="mongodb+srv://triptoroy:triptoroy404@testdatabase.mtqw7te.mongodb.net/playground?retryWrites=true&w=majority"
# DATABASE_URL="postgresql://postgres@localhost:5432/node_db_oauth"
DATABASE_URL="postgresql://postgres:FXSvwBviwFWNVfWW@db.oajxusxzqqhuwzvyniyc.supabase.co:5432/postgres"
# DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
ENCRYPTION_STATUS = "FALSE"

PORT = 5001
ACCESS_TOKEN_LIFETIME = 3600
MULTIPLE_DEVICE_LOGIN = "TRUE"

SUPABASE_DATABASE = "https://oajxusxzqqhuwzvyniyc.supabase.co"
SUPABASE_SECRET_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hanh1c3h6cXFodXd6dnluaXljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4NDIxNDYwNSwiZXhwIjoxOTk5NzkwNjA1fQ.jLKu1SQQQU43icSaIQK4wohvc_W-s5j-75GJ3ylEFYs"
SUPABASE_BUCKET_URL = "https://oajxusxzqqhuwzvyniyc.supabase.co/storage/v1/object/public/"

```

## Flow:

- `npm i` to install all dependencies
- update "MONGO_DATABASE_URL" or "DATABASE_URL" in the .env file

- `npm run index` to run the regular express server
- `npm run server` to run the multicluster express server
- `npm run socket` to run the express server with socket

### Multi cluster

The server.js is is for multicluster node js. It will make server depending on the available cpu cores.

## Prisma commands:

- After creating//modifying a schema use command to migrate `npx prisma migrate dev --name init`
- after migration run deploy command `npx prisma migrate deploy`

## Prisma relational database - Deleting one row and delete other relational rows:

In this example, the "onDelete: Cascade" attribute is added to the owner and buildBy field in the house model. This tells Prisma to automatically delete all associated houses when a user is deleted.

```
model user {
  id         String   @id @default(uuid())
  name       String   @unique
  createdAt  DateTime @default(now())
  createdBy  String   @default("admin")
  isAdmin    Boolean  @default(false)
  updatedAt  DateTime @updatedAt
  HouseOwned house[]  @relation("HouseOwner")
  HouseBuilt house[]  @relation("HouseBuilder")
}

model house {
  id           String   @id @default(uuid())
  address      String   @unique
  wifiPassword String?
  owner        user     @relation("HouseOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  ownerId      String
  buildBy      user     @relation("HouseBuilder", fields: [buildById], references: [id], onDelete: Cascade)
  buildById    String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

# How to use prisma query:

In the file write below codes.

```
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
```

this will initialize prisma in that file. then to get data from a model ->

`let userData = await prisma.user.findMany() `
