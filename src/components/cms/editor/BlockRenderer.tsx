import React from 'react';
import { ComponentData } from '@/store/types';
import { useSiteStore } from '@/store/useSiteStore';
import { twMerge } from 'tailwind-merge';

interface BlockRendererProps {
    component: ComponentData;
    isEditable?: boolean;
}

export default function BlockRenderer({ component, isEditable = true }: BlockRendererProps) {
    const { selectedComponentId, setSelectedComponent } = useSiteStore();

    if (!component) return null;

    const isSelected = isEditable && selectedComponentId === component.id;

    const handleClick = (e: React.MouseEvent) => {
        if (!isEditable) return;
        e.stopPropagation();
        setSelectedComponent(component.id);
    };

    const renderComponent = () => {
        switch (component.type) {
            case 'HeroCover':
                return (
                    <div
                        className="relative w-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden rounded-lg group"
                        style={{
                            paddingTop: `${(component.props.paddingY || 4) * 0.5}rem`,
                            paddingBottom: `${(component.props.paddingY || 4) * 0.5}rem`,
                            minHeight: '16rem'
                        }}
                    >
                        <img
                            src={component.props.imageUrl || component.props.image || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80"}
                            alt={component.props.alt || "Hero Image"}
                            className="absolute inset-0 w-full h-full object-cover opacity-50"
                        />
                        <div className="relative z-10 text-center p-4">
                            {React.createElement(
                                component.props.tag || 'h1',
                                { className: "text-3xl font-bold text-gray-900 dark:text-white" },
                                component.props.title || 'Hero Section'
                            )}
                            <p className="text-gray-700 dark:text-gray-200 mt-2">{component.props.subtitle || 'Drag & Drop content here'}</p>
                        </div>
                    </div>
                );

            case 'RichText':
                return (
                    <div className={twMerge(
                        "prose dark:prose-invert max-w-none",
                        isEditable && "p-4 border border-dashed border-gray-300 dark:border-zinc-700 rounded-lg min-h-[100px]"
                    )}
                        dangerouslySetInnerHTML={{ __html: component.props.content || (isEditable ? '<h3>Rich Text Block</h3><p>Start typing your content here...</p>' : '') }}
                    />
                );

            case 'GridSystem':
                const cols = parseInt(String(component.props.cols || component.props.columns || 3));
                return (
                    <div
                        className={twMerge(
                            "grid gap-4",
                            isEditable && "p-4 border border-dashed border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg"
                        )}
                        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                    >
                        {(component.props.items || ['Col 1', 'Col 2', 'Col 3']).map((item: any, i: number) => (
                            <div key={i} className="h-24 bg-gray-50 dark:bg-zinc-900 rounded border border-gray-100 dark:border-zinc-800 flex items-center justify-center text-xs text-gray-400">
                                {typeof item === 'string' ? item : (item.title || `Item ${i + 1}`)}
                            </div>
                        ))}
                    </div>
                );

            case 'ProductShowcase':
                return (
                    <div className={twMerge(
                        "flex gap-4 p-6 border rounded-xl bg-white dark:bg-zinc-900 shadow-sm",
                        isEditable && "border-dashed"
                    )}>
                        <div className="w-24 h-24 bg-gray-100 dark:bg-zinc-800 rounded-lg shrink-0 overflow-hidden">
                            {(component.props.imageUrl || component.props.image) && (
                                <img src={component.props.imageUrl || component.props.image} alt={component.props.title} className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">{component.props.title || 'Product/Project Title'}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{component.props.description || 'Short description of the project goes here. Showcase your work.'}</p>
                            {component.props.price && <p className="text-blue-500 font-bold mt-2">{component.props.price}</p>}
                        </div>
                    </div>
                );

            default:
                return <div className="p-4 border border-red-200 text-red-500">Unknown Component: {component.type}</div>;
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`
                relative mb-4 transition-all duration-200
                ${isEditable ? 'cursor-pointer hover:ring-2 hover:ring-blue-300 hover:ring-offset-2' : ''}
                ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 z-10' : ''}
            `}
        >
            {/* Component Rendering */}
            {renderComponent()}

            {/* Label Tag on Selection */}
            {isSelected && (
                <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-t-md">
                    {component.type}
                </div>
            )}
        </div>
    );
}
