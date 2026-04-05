import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Layout, Globe, Paintbrush, ToggleLeft, ToggleRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePageLayouts, useDeletePageLayout, useSavePageLayout } from '@/hooks/usePageLayouts';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { SECTION_TEMPLATES, type SectionTemplate } from '@/lib/sectionTemplates';
import { getExistingDesign } from '@/lib/existingDesignTemplates';

const CORE_PAGES = [
  { slug: 'home', title: 'Home', path: '/' },
  { slug: 'about', title: 'About', path: '/about' },
  { slug: 'services', title: 'Services', path: '/services' },
  { slug: 'contact', title: 'Contact', path: '/contact' },
  { slug: 'gallery', title: 'Gallery', path: '/gallery' },
  { slug: 'blog', title: 'Blog', path: '/blog' },
];

const AdminPageLayouts = () => {
  const { data: layouts, isLoading } = usePageLayouts();
  const deleteLayout = useDeletePageLayout();
  const saveLayout = useSavePageLayout();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [pendingCreate, setPendingCreate] = useState<{ slug: string; title: string } | null>(null);
  const [publishConfirm, setPublishConfirm] = useState<{ id: string; title: string; publish: boolean } | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteLayout.mutateAsync(id);
      toast({ title: 'Deleted', description: 'Page layout removed.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleTogglePublish = async (id: string, currentlyPublished: boolean) => {
    try {
      const layout = layouts?.find(l => l.id === id);
      if (!layout) return;
      await saveLayout.mutateAsync({
        id,
        page_slug: layout.page_slug,
        page_title: layout.page_title,
        layout_json: layout.layout_json,
        is_published: !currentlyPublished,
      });
      toast({
        title: !currentlyPublished ? 'Published!' : 'Unpublished',
        description: !currentlyPublished
          ? 'Visual builder layout is now live.'
          : 'Reverted to original design.',
      });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleCreateNew = () => {
    if (!newTitle.trim()) return;
    const slug = newSlug.trim() || newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setPendingCreate({ slug, title: newTitle });
    setShowNew(false);
    setShowTemplatePicker(true);
  };

  const handleDesignCorePage = (slug: string, title: string) => {
    const existing = layouts?.find(l => l.page_slug === slug);
    if (existing) {
      navigate(`/admin/page-builder/${existing.id}`);
    } else {
      setPendingCreate({ slug, title });
      setShowTemplatePicker(true);
    }
  };

  const handleSelectTemplate = (template: SectionTemplate) => {
    if (!pendingCreate) return;
    const templateLayout = template.layout();
    // Navigate to builder with template data stored in sessionStorage
    if (templateLayout.length > 0) {
      sessionStorage.setItem('builder_template', JSON.stringify(templateLayout));
    }
    navigate(`/admin/page-builder/new?slug=${encodeURIComponent(pendingCreate.slug)}&title=${encodeURIComponent(pendingCreate.title)}${templateLayout.length > 0 ? '&template=true' : ''}`);
    setShowTemplatePicker(false);
    setPendingCreate(null);
  };

  const getCorePageLayout = (slug: string) => layouts?.find(l => l.page_slug === slug);

  const customLayouts = layouts?.filter(l => !CORE_PAGES.some(cp => cp.slug === l.page_slug)) || [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visual Page Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">Design and manage all page layouts visually</p>
        </div>
        <Button onClick={() => { setNewTitle(''); setNewSlug(''); setShowNew(true); }}>
          <Plus className="h-4 w-4 mr-2" /> New Page
        </Button>
      </div>

      {/* ── Core Pages ───────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Core Pages</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Redesign your main pages through the visual builder. Original design is used until you publish a builder layout.
        </p>
        <div className="grid gap-3">
          {CORE_PAGES.map(cp => {
            const layout = getCorePageLayout(cp.slug);
            const isPublished = layout?.is_published || false;
            return (
              <Card key={cp.slug} className="hover:shadow-card transition-shadow">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Layout className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{cp.title}</h3>
                      <p className="text-xs text-muted-foreground">{cp.path}</p>
                    </div>
                    <Badge variant={isPublished ? 'default' : 'secondary'} className="ml-2">
                      {isPublished ? '✨ Visual Builder' : 'Original Design'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="text-xs h-8"
                      onClick={() => handleDesignCorePage(cp.slug, cp.title)}>
                      <Paintbrush className="h-3.5 w-3.5 mr-1" />
                      {layout ? 'Edit Design' : 'Design'}
                    </Button>
                    {layout && (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => window.open(cp.path, '_blank')} title="Preview">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant={isPublished ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => setPublishConfirm({ id: layout.id, title: cp.title, publish: !isPublished })}
                        >
                          {isPublished ? <ToggleRight className="h-3.5 w-3.5 mr-1" /> : <ToggleLeft className="h-3.5 w-3.5 mr-1" />}
                          {isPublished ? 'Unpublish' : 'Publish'}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator className="my-6" />

      {/* ── Custom Pages ─────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Layout className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Custom Pages</h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}
          </div>
        ) : customLayouts.length > 0 ? (
          <div className="grid gap-3">
            {customLayouts.map(layout => (
              <Card key={layout.id} className="hover:shadow-card transition-shadow">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Layout className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{layout.page_title}</h3>
                      <p className="text-xs text-muted-foreground">/p/{layout.page_slug}</p>
                    </div>
                    <Badge variant={layout.is_published ? 'default' : 'secondary'} className="ml-2">
                      {layout.is_published ? 'Published' : 'Draft'}
                    </Badge>
                    {layout.is_template && <Badge variant="outline" className="ml-1">Template</Badge>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => navigate(`/admin/page-builder/${layout.id}`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => window.open(`/p/${layout.page_slug}`, '_blank')}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
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
              <h3 className="text-lg font-semibold text-foreground">No custom pages yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Create a new page to get started</p>
              <Button className="mt-4" onClick={() => { setNewTitle(''); setNewSlug(''); setShowNew(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Create Page
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── New page dialog ──────────────────────────── */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Page</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Page Title</Label>
              <Input
                value={newTitle}
                onChange={e => {
                  setNewTitle(e.target.value);
                  setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                }}
                placeholder="e.g. Promotions"
              />
            </div>
            <div>
              <Label>URL Slug</Label>
              <Input value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder="e.g. promotions" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={handleCreateNew} disabled={!newTitle.trim()}>Next: Choose Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Template Picker dialog ──────────────────── */}
      <Dialog open={showTemplatePicker} onOpenChange={setShowTemplatePicker}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Choose a Starting Template</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2 max-h-[60vh] overflow-y-auto">
            {SECTION_TEMPLATES.map(template => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
              >
                <span className="text-2xl">{template.icon}</span>
                <div>
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{template.label}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Publish confirmation ─────────────────────── */}
      <AlertDialog open={!!publishConfirm} onOpenChange={() => setPublishConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {publishConfirm?.publish ? 'Publish Visual Layout?' : 'Revert to Original Design?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {publishConfirm?.publish
                ? `This will replace the current "${publishConfirm.title}" page with your visual builder layout. Visitors will see the new design immediately.`
                : `This will revert "${publishConfirm?.title}" to its original hardcoded design. Your builder layout will be saved as a draft.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (publishConfirm) {
                handleTogglePublish(publishConfirm.id, !publishConfirm.publish);
                setPublishConfirm(null);
              }
            }}>
              {publishConfirm?.publish ? 'Publish' : 'Unpublish'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPageLayouts;
