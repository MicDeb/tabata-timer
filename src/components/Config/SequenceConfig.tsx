import type { SequenceConfig as SequenceConfigType, SequenceStep } from '../../types/workout';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SequenceConfigProps {
  config: SequenceConfigType;
  onChange: (config: SequenceConfigType) => void;
}

interface SortableStepProps {
  step: SequenceStep;
  onUpdate: (step: SequenceStep) => void;
  onDelete: () => void;
}

function SortableStep({ step, onUpdate, onDelete }: SortableStepProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-gray-800 rounded-lg p-2"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-500 hover:text-gray-300 px-1"
        aria-label="Przeciągnij"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      <input
        type="text"
        className="input-field flex-1 text-sm py-1"
        value={step.name}
        onChange={(e) => onUpdate({ ...step, name: e.target.value })}
        placeholder="Nazwa ćwiczenia"
      />

      <input
        type="number"
        className="input-field w-20 text-sm py-1"
        min={5}
        max={3600}
        value={step.durationSeconds}
        onChange={(e) =>
          onUpdate({ ...step, durationSeconds: Math.max(5, parseInt(e.target.value) || 5) })
        }
      />
      <span className="text-xs text-gray-500 shrink-0">s</span>

      <button
        onClick={onDelete}
        className="text-red-400 hover:text-red-300 px-1"
        aria-label="Usuń krok"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function SequenceConfig({ config, onChange }: SequenceConfigProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addStep = () => {
    const newStep: SequenceStep = {
      id: `step-${Date.now()}`,
      name: '',
      durationSeconds: 30,
    };
    onChange({ ...config, steps: [...config.steps, newStep] });
  };

  const updateStep = (index: number, updated: SequenceStep) => {
    const steps = [...config.steps];
    steps[index] = updated;
    onChange({ ...config, steps });
  };

  const deleteStep = (index: number) => {
    const steps = config.steps.filter((_, i) => i !== index);
    onChange({ ...config, steps });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = config.steps.findIndex((s) => s.id === active.id);
      const newIndex = config.steps.findIndex((s) => s.id === over.id);
      onChange({ ...config, steps: arrayMove(config.steps, oldIndex, newIndex) });
    }
  };

  const totalSeconds = config.steps.reduce((sum, s) => sum + s.durationSeconds, 0) * Math.max(1, config.repeatTimes);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Sekwencja ćwiczeń</h3>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={config.steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {config.steps.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">
                Brak kroków. Dodaj pierwsze ćwiczenie.
              </p>
            )}
            {config.steps.map((step, index) => (
              <SortableStep
                key={step.id}
                step={step}
                onUpdate={(updated) => updateStep(index, updated)}
                onDelete={() => deleteStep(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={addStep}
        className="btn-secondary w-full text-sm"
      >
        + Dodaj ćwiczenie
      </button>

      <div>
        <label className="label-text">Powtórzeń całej sekwencji</label>
        <input
          type="number"
          className="input-field"
          min={1}
          max={20}
          value={config.repeatTimes}
          onChange={(e) =>
            onChange({ ...config, repeatTimes: Math.max(1, parseInt(e.target.value) || 1) })
          }
        />
      </div>

      <p className="text-xs text-gray-500">
        {config.steps.length} kroków × {config.repeatTimes}× = ~{Math.round(totalSeconds / 60)}min
      </p>
    </div>
  );
}
