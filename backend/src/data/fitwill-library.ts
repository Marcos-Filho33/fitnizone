import fs from 'fs';
import path from 'path';

export type FitwillExerciseItem = {
  sourceId: string;
  sourceUrl: string;
  name: string;
  bodyPart: string;
  primaryMuscle: string;
  equipment: string;
  overview: string[];
  instructions: string[];
  tips: string[];
  imageUrl: string | null;
  videoUrl: string | null;
};

type FitwillExerciseCatalog = {
  generatedAt: string;
  source: string;
  totalPages: number;
  totalExercises: number;
  bodyParts: string[];
  primaryMuscles: string[];
  equipments: string[];
  items: FitwillExerciseItem[];
};

type IndexedFitwillExerciseItem = FitwillExerciseItem & {
  searchIndex: string;
};

export function normalizeSearchValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function resolveCatalogPath() {
  const candidates = [
    path.resolve(__dirname, 'fitwill-exercises.json'),
    path.resolve(__dirname, '../../src/data/fitwill-exercises.json')
  ];

  const catalogPath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!catalogPath) {
    throw new Error('Fitwill exercise catalog file was not found.');
  }

  return catalogPath;
}

export const fitwillExerciseCatalog = JSON.parse(
  fs.readFileSync(resolveCatalogPath(), 'utf8')
) as FitwillExerciseCatalog;

const indexedFitwillExercises: IndexedFitwillExerciseItem[] = fitwillExerciseCatalog.items.map((item) => ({
  ...item,
  searchIndex: normalizeSearchValue(
    [
      item.name,
      item.bodyPart,
      item.primaryMuscle,
      item.equipment,
      item.overview.join(' '),
      item.instructions.join(' '),
      item.tips.join(' ')
    ].join(' ')
  )
}));

type ListFitwillExercisesOptions = {
  query?: string;
  bodyPart?: string;
  primaryMuscle?: string;
  equipment?: string;
  page?: number;
  pageSize?: number;
};

export function listFitwillExercises(options: ListFitwillExercisesOptions) {
  const normalizedQuery = options.query ? normalizeSearchValue(options.query) : '';
  const pageSize = Math.min(Math.max(options.pageSize ?? 24, 1), 48);

  const filteredItems = indexedFitwillExercises.filter((item) => {
    if (options.bodyPart && item.bodyPart !== options.bodyPart) {
      return false;
    }

    if (options.primaryMuscle && item.primaryMuscle !== options.primaryMuscle) {
      return false;
    }

    if (options.equipment && item.equipment !== options.equipment) {
      return false;
    }

    if (normalizedQuery && !item.searchIndex.includes(normalizedQuery)) {
      return false;
    }

    return true;
  });

  const total = filteredItems.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const currentPage = totalPages === 0 ? 1 : Math.min(Math.max(options.page ?? 1, 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    meta: {
      generatedAt: fitwillExerciseCatalog.generatedAt,
      source: fitwillExerciseCatalog.source,
      total,
      totalPages,
      page: currentPage,
      pageSize,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      catalogSize: fitwillExerciseCatalog.totalExercises,
      bodyPartCount: fitwillExerciseCatalog.bodyParts.length,
      primaryMuscleCount: fitwillExerciseCatalog.primaryMuscles.length,
      equipmentCount: fitwillExerciseCatalog.equipments.length
    },
    filters: {
      bodyParts: fitwillExerciseCatalog.bodyParts,
      primaryMuscles: fitwillExerciseCatalog.primaryMuscles,
      equipments: fitwillExerciseCatalog.equipments
    },
    items: filteredItems.slice(startIndex, endIndex).map(({ searchIndex, ...item }) => item)
  };
}
