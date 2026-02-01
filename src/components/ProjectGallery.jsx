import { useGetAllProjects } from '../hooks/useQueries';
import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Image as ImageIcon } from 'lucide-react';
import ProjectCard from './ProjectCard';

function ProjectSkeleton() {
  return (
    <Card>
      <Skeleton className="aspect-video w-full" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardHeader>
    </Card>
  );
}

export default function ProjectGallery() {
  const { data: projects, isLoading } = useGetAllProjects();

  return (
    <section className="space-y-6">
      {/* <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-chart-1 bg-clip-text text-transparent">
          Project Gallery
        </h2>
        <p className="text-muted-foreground">
          {projects && projects.length > 0
            ? `${projects.length} project${projects.length === 1 ? '' : 's'} uploaded`
            : 'No projects yet. Upload your first project above!'}
        </p>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <ProjectSkeleton />
            <ProjectSkeleton />
            <ProjectSkeleton />
          </>
        ) : projects && projects.length > 0 ? (
          projects.map((project) => <ProjectCard key={project.id} project={project} showActions />)
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium">No projects yet</p>
                <p className="text-muted-foreground">
                  Upload your first project using the form above
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
