## Prisma commands:
- After creating//modifying a schema use command to migrate ``` npx prisma migrate dev --name init --create-only ```
- after migration run deploy command ``` npx prisma migrate deploy ```


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

## Flow:
- ```npm i``` to install all dependencies
- update "DATABASE_URL" in the .env file
- ```npm run test``` to start the server
