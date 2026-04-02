import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, FileText, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePageLayouts, useDeletePageLayout } from '@/hooks/usePageLayouts';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const AdminPageLayouts = () => {
  const { data: layouts, isLoading } = usePageLayouts();
  const deleteLayout = useDeletePageLayout();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');

  const handleDelete = async (id: string) => {
    try {
      await deleteLayout.mutateAsync(id);
      toast({ title: 'Deleted', description: 'Page layout removed.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleCreateNew = () => {
    if (!newTitle.trim()) return;
    const slug = newSlug.trim() || newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    navigate(`/admin/page-builder/new?slug=${encodeURIComponent(slug)}&title=${encodeURIComponent(newTitle)}`);
    setShowNew(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visual Page Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">Build and manage page layouts visually</p>
        </div>
        <Button onClick={() => { setNewTitle(''); setNewSlug(''); setShowNew(true); }}>
          <Plus className="h-4 w-4 mr-2" /> New Page
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : layouts && layouts.length > 0 ? (
        <div className="grid gap-4">
          {layouts.map(layout => (
            <Card key={layout.id} className="hover:shadow-card transition-shadow">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Layout className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{layout.page_title}</h3>
                    <p className="text-xs text-muted-foreground">/{layout.page_slug}</p>
                  </div>
                  <Badge variant={layout.is_published ? 'default' : 'secondary'} className="ml-2">
                    {layout.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  {layout.is_template && (
                    <Badge variant="outline" className="ml-1">Template</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/admin/page-builder/${layout.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete layout?</AlertDialogTitle>
                        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(layout.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Layout className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No page layouts yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first visual page layout</p>
            <Button className="mt-4" onClick={() => { setNewTitle(''); setNewSlug(''); setShowNew(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Create Page
            </Button>
          </CardContent>
        </Card>
      )}

      {/* New page dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Page Title</Label>
              <Input
                value={newTitle}
                onChange={e => {
                  setNewTitle(e.target.value);
                  setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                }}
                placeholder="e.g. About Us"
              />
            </div>
            <div>
              <Label>URL Slug</Label>
              <Input value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder="e.g. about-us" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={handleCreateNew} disabled={!newTitle.trim()}>Create & Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPageLayouts;
