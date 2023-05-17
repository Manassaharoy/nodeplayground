const dotenv = require("dotenv").config();

//? Supabase initialize
const { createClient } = require("@supabase/supabase-js");
const { coloredLog } = require("../utils/coloredLog");

// Create a single supabase client for interacting with your database
const supabase = createClient(
  process.env.SUPABASE_DATABASE,
  process.env.SUPABASE_SECRET_KEY
);

const createBuckets = async () => {
  await supabase.storage
    .listBuckets()
    .then(async (buckets) => {
      if (buckets.data.length === 0) {
        await supabase.storage.createBucket("profilePhotos", {
          public: true,
          // allowedMimeTypes: ["image/png"],
          // fileSizeLimit: 5000,
        });
        coloredLog(["profilePhotos bucket created successfully"], 2);
      } else {
        const profilePhotosBucketExists = buckets.data.find(
          (bucket) => bucket.name === "profilePhotos"
        );

        //TODO: REMOVE THIS IF YOU DONT NEED THIS ONE
        const ProductPhotosBucketExists = buckets.data.find(
          (bucket) => bucket.name === "productPhotos"
        );

        //* profilePhotos bucket
        if (!profilePhotosBucketExists) {
          await supabase.storage.createBucket("profilePhotos", {
            public: true,
            // allowedMimeTypes: ["image/png"],
            // fileSizeLimit: 5000,
          });
          coloredLog(["profilePhotos bucket created successfully"], 2);
        } else {
          coloredLog(["profilePhotos Bucket already exists"], 1);
        }

        //TODO: REMOVE BELOW CODE IF YOU DONT NEED THIS productPhotos BUCKET
        //* profilePhotos bucket
        if (!ProductPhotosBucketExists) {
          await supabase.storage.createBucket("productPhotos", {
            public: true,
            // allowedMimeTypes: ["image/png"],
            // fileSizeLimit: 5000,
          });
          coloredLog(["productPhotos bucket created successfully"], 2);
        } else {
          coloredLog(["productPhotos Bucket already exists"], 1);
        }
      }
    })
    .catch((error) => {
      coloredLog(["Error while creating bucket:", JSON.stringify(error)], 1);
    });
};
module.exports = createBuckets;
