import DragAndDropUpload from "@/components/DragAndDropUpload";

export default function UploadResumePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Upload Resume</h1>
      <div className="flex justify-center">
        <DragAndDropUpload />
      </div>
    </div>
  );
}
