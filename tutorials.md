# prisma

- how to include and exclude specific columns from a data:
  to include field:

```
let data = await prisma.profile.findUnique({
    where: {
      userId,
    },
    include: {
      user: true,
    },
  });
```

to exclude field:

```
let data = await prisma.profile.findUnique({
    where: {
      userId,
    },
    include: {
      user: true,
    },
  });

  function excludePasswordAndID(user, keys) {
    for (let key of keys) {
      delete user[key];
      delete user.user[key];
    }
    return user;
  }
  const userWithoutPassword = excludePasswordAndID(data, ["password", "id"]);
```
