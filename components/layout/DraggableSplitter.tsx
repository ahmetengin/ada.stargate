
import React, { useCallback, useRef } from 'react';

interface DraggableSplitterProps {
    onDrag: (dx: number) => void;
}

export const DraggableSplitter: React.FC<DraggableSplitterProps> = ({ onDrag }) => {
    const isDraggingRef = useRef(false);
    const lastXRef = useRef(0);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        isDraggingRef.current = true;
        lastXRef.current = e.clientX;
        document.body.style.cursor = 'col-resize';
        
        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (isDraggingRef.current) {
                const dx = moveEvent.clientX - lastXRef.current;
                onDrag(dx);
                lastXRef.current = moveEvent.clientX;
            }
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
            document.body.style.cursor = 'default';
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [onDrag]);

    return (
        <div 
            className="w-1.5 h-full cursor-col-resize group flex items-center justify-center flex-shrink-0"
            onMouseDown={handleMouseDown}
        >
            <div className="w-0.5 h-full bg-transparent group-hover:bg-[var(--accent-color)] transition-colors duration-200"></div>
        </div>
    );
};
