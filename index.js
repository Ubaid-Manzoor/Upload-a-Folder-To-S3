const S3Client = require("./s3Client");
const fs = require("fs");
const path = require("path");

const { PutObjectCommand } = require("@aws-sdk/client-s3");

const uploadFoldertoS3 = async ({ local_folder, remote_folder }) => {
  fs.readdir(local_folder, async (error, contents) => {
    if (error) throw error;
    if (!contents || contents.length === 0) return;

    for (const content of contents) {
      const content_path = path.join(local_folder, content);
      console.log(content_path);

      if (fs.lstatSync(content_path).isDirectory()) {
        await uploadFoldertoS3({
          local_folder: content_path,
          remote_folder: path.join(remote_folder, content),
        });
      } else {
        fs.readFile(content_path, async (error, file_content) => {
          await S3Client.send(
            new PutObjectCommand({
              Bucket: "development-ubaid",
              Key: path.join(remote_folder, content),
              Body: file_content,
            })
          );
        });
      }
    }
  });
};

(async () => {
  await uploadFoldertoS3({ local_folder: "./to_upload", remote_folder: "local_folder" });
})();
