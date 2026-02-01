import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react';
import { useAddProject } from '../hooks/useQueries';
import { toast } from 'sonner';
// import Cropper from 'react-easy-crop';

export default function UploadProject() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [codeUrl, setCodeUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [showUploadProject, setUploadProject] = useState();

  const { mutate: addProject, isPending } = useAddProject();

  // const [crop, setCrop] = useState({ x: 0, y: 0 });
  // const [zoom, setZoom] = useState(1);
  // const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  // const [isCropping, setIsCropping] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload an image (JPEG, PNG, WebP) or video (MP4, WebM).');
        return;
      }

      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File size too large. Maximum size is 50MB.');
        return;
      }

      // if (file.type.startsWith('image/')) {
      //   setIsCropping(true);
      // }


      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a project title');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a project description');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a media file');
      return;
    }

    try {
      setUploadProgress(0);

      addProject(
        {
          title: title.trim(),
          description: description.trim(),
          liveDemoUrl: liveDemoUrl.trim() || undefined,
          codeUrl: codeUrl.trim() || undefined,
          file: selectedFile,
          onProgress: setUploadProgress,
        },
        {
          onSuccess: () => {
            toast.success('Project uploaded successfully!');
            setTitle('');
            setDescription('');
            setLiveDemoUrl('');
            setCodeUrl('');
            handleRemoveFile();
            setUploadProgress(0);
          },
          onError: (error) => {
            toast.error(`Failed to upload project: ${error.message}`);
            setUploadProgress(0);
          },
        }
      );
    } catch (error) {
      toast.error('An unexpected error occurred');
      setUploadProgress(0);
    }
  };

  const isVideo = selectedFile?.type.startsWith('video/');

  return (
    <Card className="border-2">
      
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload New Project
        </CardTitle>
        <CardDescription>
          Add a new project with title, description, and media (image or video)
        </CardDescription>
      </CardHeader>
      <div>
        <button className='border px-2 py-2 ml-5 text-primary rounded-sm transition-all duration-300 ease-in-out hover:bg-slate-100 hover:shadow-md hover:shadow-black' 
        onClick={() => setUploadProject(!showUploadProject)}>
        Upload Project
        </button>
      </div>

    {showUploadProject && (
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              placeholder="Enter project title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your project"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="liveDemoUrl">Live Demo URL (optional)</Label>
            <Input
              id="liveDemoUrl"
              type="url"
              placeholder="https://demo.example.com"
              value={liveDemoUrl}
              onChange={(e) => setLiveDemoUrl(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="codeUrl">Code URL (optional)</Label>
            <Input
              id="codeUrl"
              type="url"
              placeholder="https://github.com/username/repo"
              value={codeUrl}
              onChange={(e) => setCodeUrl(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label>Media Upload</Label>
            <div className="space-y-4">
              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Click to upload media</p>
                      <p className="text-sm text-muted-foreground">
                        Images (JPEG, PNG, WebP) or Videos (MP4, WebM)
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Maximum file size: 50MB
                      </p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isPending}
                  />
                </div>
              ) : (
                <div className="relative border-2 border-border rounded-lg overflow-hidden">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    {previewUrl && (
                      <>
                        {isVideo ? (
                          <video
                            src={previewUrl}
                            className="w-full h-full object-contain"
                            controls
                          />
                        ) : (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                        )}
                      </>
                    )}
                  </div>
                  <div className="absolute top-2 right-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={handleRemoveFile}
                      disabled={isPending}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur px-2 py-1 rounded flex items-center gap-2 text-xs">
                    {isVideo ? (
                      <Video className="h-3 w-3" />
                    ) : (
                      <ImageIcon className="h-3 w-3" />
                    )}
                    <span className="font-medium">{selectedFile.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isPending && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !title.trim() || !description.trim() || !selectedFile}
          >
            {isPending ? 'Uploading...' : 'Upload Project'}
          </Button>
        </form>
      </CardContent>
    )}
      
    </Card>
  );
}
