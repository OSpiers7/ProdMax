import { useEffect, useRef } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import type { CalendarEvent, Category } from '../../types';

interface EventContextMenuProps {
  event: CalendarEvent;
  position: { x: number; y: number };
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
  onChangeColor: (event: CalendarEvent, categoryId: string) => void;
  categories: Category[];
}

const EventContextMenu: React.FC<EventContextMenuProps> = ({
  event,
  position,
  onClose,
  onEdit,
  onDelete,
  onChangeColor,
  categories
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Prevent context menu from closing when clicking inside
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleEdit = () => {
    onEdit(event);
    onClose();
  };

  const handleDelete = () => {
    onDelete(event);
    onClose();
  };

  const handleColorChange = (categoryId: string) => {
    onChangeColor(event, categoryId);
    onClose();
  };

  // Get current category ID
  const currentCategoryId = event.task?.categoryId || event.category?.id || '';

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-50 min-w-[200px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onClick={handleMenuClick}
    >
      {/* Edit Option */}
      <button
        onClick={handleEdit}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors"
      >
        <Edit className="h-4 w-4" />
        <span>Edit Event</span>
      </button>

      {/* Change Color Section */}
      <div className="border-t border-gray-200 my-1"></div>
      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
        Change Color
      </div>
      <div className="px-2 py-1">
        <div className="grid grid-cols-4 gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleColorChange(category.id)}
              className={`relative p-3 rounded-md transition-all hover:scale-110 ${
                currentCategoryId === category.id
                  ? 'ring-2 ring-gray-400 ring-offset-2'
                  : ''
              }`}
              style={{ backgroundColor: category.color }}
              title={category.name}
            >
              {currentCategoryId === category.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Delete Option */}
      <div className="border-t border-gray-200 my-1"></div>
      <button
        onClick={handleDelete}
        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
        <span>Delete Event</span>
      </button>
    </div>
  );
};

export default EventContextMenu;

