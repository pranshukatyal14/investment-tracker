import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Plus, Trash2 } from "lucide-react";
import { Category } from "@/types/investment";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (category: Omit<Category, "id">) => void;
  onDelete: (id: string) => void;
  onAddSubcategory?: (categoryId: string, subcategory: { name: string; parentCategoryId: string }) => void;
}

const PRESET_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#eab308", 
  "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"
];

export function CategoryManager({ categories, onAdd, onDelete, onAddSubcategory }: CategoryManagerProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [subcategoryName, setSubcategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Category already exists");
      return;
    }

    onAdd({
      name: name.trim(),
      color: selectedColor,
    });

    setName("");
    setSelectedColor(PRESET_COLORS[0]);
    toast.success("Category added successfully!");
  };

  const handleAddSubcategory = (categoryId: string) => {
    if (!subcategoryName.trim()) {
      toast.error("Please enter a subcategory name");
      return;
    }

    const category = categories.find(c => c.id === categoryId);
    if (category?.subcategories?.some(sub => sub.name.toLowerCase() === subcategoryName.toLowerCase())) {
      toast.error("Subcategory already exists");
      return;
    }

    if (onAddSubcategory) {
      onAddSubcategory(categoryId, {
        name: subcategoryName.trim(),
        parentCategoryId: categoryId
      });
    }

    setSubcategoryName("");
    setSelectedCategoryId("");
    toast.success("Subcategory added successfully!");
  };

  const handleDelete = (id: string) => {
    if (categories.length <= 1) {
      toast.error("You must have at least one category");
      return;
    }
    onDelete(id);
    toast.success("Category deleted");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Investment Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Category */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                placeholder="e.g., Real Estate, Crypto"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Category Color</Label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="h-10 w-10 rounded-full border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor: selectedColor === color ? "#000" : "transparent",
                    }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full bg-gradient-success hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </form>

          {/* Existing Categories */}
          <div className="space-y-2">
            <Label>Existing Categories</Label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {categories.map((category) => (
                <Card key={category.id} className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Show subcategories if they exist */}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="ml-7 space-y-1">
                      {category.subcategories.map((subcat) => (
                        <div key={subcat.id} className="text-sm text-muted-foreground">
                          • {subcat.name}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add subcategory section */}
                  <div className="ml-7 mt-2">
                    {selectedCategoryId === category.id ? (
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="Subcategory name"
                          value={subcategoryName}
                          onChange={(e) => setSubcategoryName(e.target.value)}
                          className="text-sm h-8"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddSubcategory(category.id)}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddSubcategory(category.id)}
                          className="h-8 px-2"
                        >
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedCategoryId("");
                            setSubcategoryName("");
                          }}
                          className="h-8 px-2"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedCategoryId(category.id)}
                        className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                      >
                        + Add Subcategory
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
