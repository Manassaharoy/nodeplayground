# ENV FILE:

The env file must contain bellow values:

```
MONGO_DATABASE_URL=""
DATABASE_URL=""
ENCRYPTION_STATUS = "FALSE"

PORT = 5001

BUCKET_LINK = ""

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

- After creating//modifying a schema use command to migrate `npx prisma migrate dev --name init --create-only`
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
