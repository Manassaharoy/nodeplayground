// Prisma pagination

const getAllDevices = tryCatchMiddleware(async (req, res, next) => {

  let page = parseInt(req.query.page)<=0 ? 0 : parseInt(req.query.page) - 1 || 0
  let items = parseInt(req.query.items)<=0 && 10 || parseInt(req.query.items)>=100 && 100 || 10

  console.log(page, items);

  //? STATIC
  // let devices = await prisma.device.findMany({
  //   where: {
  //     is_delete: false,
  //     OR: [
  //       { AND: [{ device_id: "Asus" }, { imei: "134654616" }] },
  //       { AND: [{ device_id: "Asus" }, { imei: "4781258428" }] },
  //       { AND: [{ device_id: "Oneplus" }, { imei: "134654616" }] },
  //     ],
  //   },
  // });

  //?Dynamic
  let device_ids = ["Asus", "Asus", "Oneplus"];
  let imeis = ["134654616", "4781258428", "134654616"];

  let whereClause = {
    is_delete:false,
    OR: device_ids.map((deviceId, index) => ({
      AND: [{ device_id: deviceId }, { imei: imeis[index] }],
    })),
  };

  let devices = await prisma.device.findMany({
    where: whereClause,
    // include: { ack_msg: true },
    select: {
      device_id:true,
      imei:true,
      mercent_number:true,
      createdAt:true,
      createdBy:true,
      ack_msg: {
        select: {
          id: false,
          message_id: true,
          device_id: true,
          createdAt: true,
          createdBy: true,
          receiving_time: true,
          is_delete: false,
        },
      },
    },
    skip: page,
    take: items
  });

  responseSend(res, devices);
});