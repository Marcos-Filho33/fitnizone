import { Difficulty, MuscleGroup } from '@prisma/client';

export type FoodCatalogItem = {
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  category: string;
  source: string;
};

export type ExerciseCatalogItem = {
  name: string;
  description: string;
  muscleGroup: MuscleGroup;
  difficulty: Difficulty;
  instructions: string;
};

export const defaultAdminAccount = {
  name: 'Administrador FITZONE'
};

export const foodCatalog: FoodCatalogItem[] = [
  { name: 'Frango', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, category: 'Proteina', source: 'USDA FoodData Central (valores aproximados por 100g)' },
  { name: 'Ovo', caloriesPer100g: 155, proteinPer100g: 12.6, carbsPer100g: 1.1, fatPer100g: 10.6, category: 'Proteina', source: 'USDA FoodData Central (valores aproximados por 100g)' },
  { name: 'Arroz', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28.2, fatPer100g: 0.3, category: 'Carboidrato', source: 'USDA FoodData Central (valores aproximados por 100g)' },
  { name: 'Feijão', caloriesPer100g: 132, proteinPer100g: 8.9, carbsPer100g: 23.7, fatPer100g: 0.5, category: 'Leguminosa', source: 'USDA FoodData Central (valores aproximados por 100g)' },
  { name: 'Banana', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 22.8, fatPer100g: 0.3, category: 'Fruta', source: 'USDA FoodData Central (valores aproximados por 100g)' },
  { name: 'Aveia', caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66.3, fatPer100g: 6.9, category: 'Cereal', source: 'USDA FoodData Central (valores aproximados por 100g)' },
  { name: 'Carne', caloriesPer100g: 217, proteinPer100g: 26.1, carbsPer100g: 0, fatPer100g: 11.8, category: 'Proteina', source: 'USDA FoodData Central (valores aproximados por 100g)' },
  { name: 'Whey', caloriesPer100g: 380, proteinPer100g: 80, carbsPer100g: 6, fatPer100g: 4, category: 'Suplemento', source: 'USDA FoodData Central (valores aproximados por 100g)' },
  { name: 'Leite', caloriesPer100g: 42, proteinPer100g: 3.4, carbsPer100g: 5, fatPer100g: 1, category: 'Laticinio', source: 'USDA FoodData Central (valores aproximados por 100g)' },
  { name: 'Batata doce', caloriesPer100g: 90, proteinPer100g: 2, carbsPer100g: 20.7, fatPer100g: 0.2, category: 'Carboidrato', source: 'USDA FoodData Central (valores aproximados por 100g)' },
  { name: 'Iogurte grego natural', caloriesPer100g: 59, proteinPer100g: 10.3, carbsPer100g: 3.6, fatPer100g: 0.4, category: 'Laticinio', source: 'USDA FoodData Central (valores aproximados por 100g)' },
  { name: 'Brócolis', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 6.6, fatPer100g: 0.4, category: 'Vegetal', source: 'USDA FoodData Central (valores aproximados por 100g)' },
  { name: 'Maçã', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 13.8, fatPer100g: 0.2, category: 'Fruta', source: 'USDA FoodData Central (valores aproximados por 100g)' },
  { name: 'Abacate', caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 8.5, fatPer100g: 14.7, category: 'Gorduras boas', source: 'USDA FoodData Central (valores aproximados por 100g)' },
  { name: 'Salmão', caloriesPer100g: 206, proteinPer100g: 22.1, carbsPer100g: 0, fatPer100g: 12.4, category: 'Proteina', source: 'USDA FoodData Central (valores aproximados por 100g)' },
  { name: 'Atum em água', caloriesPer100g: 116, proteinPer100g: 25.5, carbsPer100g: 0, fatPer100g: 0.8, category: 'Proteina', source: 'USDA FoodData Central (valores aproximados por 100g)' },
  { name: 'Pão integral', caloriesPer100g: 247, proteinPer100g: 12.5, carbsPer100g: 41.4, fatPer100g: 4.2, category: 'Carboidrato', source: 'USDA FoodData Central (valores aproximados por 100g)' },
  { name: 'Queijo cottage', caloriesPer100g: 98, proteinPer100g: 11.1, carbsPer100g: 3.4, fatPer100g: 4.3, category: 'Laticinio', source: 'USDA FoodData Central (valores aproximados por 100g)' },
  { name: 'Lentilha cozida', caloriesPer100g: 116, proteinPer100g: 9, carbsPer100g: 20.1, fatPer100g: 0.4, category: 'Leguminosa', source: 'USDA FoodData Central (valores aproximados por 100g)' },
  { name: 'Mandioca cozida', caloriesPer100g: 125, proteinPer100g: 0.6, carbsPer100g: 30.1, fatPer100g: 0.3, category: 'Carboidrato', source: 'USDA FoodData Central (valores aproximados por 100g)' },
  { name: 'Amêndoas', caloriesPer100g: 579, proteinPer100g: 21.2, carbsPer100g: 21.7, fatPer100g: 49.9, category: 'Oleaginosa', source: 'USDA FoodData Central (valores aproximados por 100g)' }
];

export const exerciseCatalog: ExerciseCatalogItem[] = [
  {
    name: 'Supino reto',
    description: 'Exercício clássico para desenvolver peitoral, tríceps e estabilidade dos ombros.',
    muscleGroup: 'PEITO',
    difficulty: 'INTERMEDIARIO',
    instructions: 'Deite no banco, firme os pés no chão, desça a barra até a linha do peito e empurre sem perder o controle.'
  },
  {
    name: 'Flexão de braços',
    description: 'Movimento com peso corporal para peito, ombros e tríceps.',
    muscleGroup: 'PEITO',
    difficulty: 'INICIANTE',
    instructions: 'Mantenha o corpo alinhado, flexione os cotovelos até aproximar o peito do chão e empurre de volta.'
  },
  {
    name: 'Supino inclinado com halteres',
    description: 'Variação que enfatiza a parte superior do peitoral com maior amplitude.',
    muscleGroup: 'PEITO',
    difficulty: 'INTERMEDIARIO',
    instructions: 'Ajuste o banco inclinado, desça os halteres ao lado do peito e suba controlando o movimento.'
  },
  {
    name: 'Crossover no cabo',
    description: 'Isolamento para peitoral com tensão contínua durante toda a execução.',
    muscleGroup: 'PEITO',
    difficulty: 'INTERMEDIARIO',
    instructions: 'Mantenha leve inclinação do tronco, traga as alças à frente do corpo e retorne sem perder a tensão.'
  },
  {
    name: 'Remada curta',
    description: 'Exercício para dorsais e parte média das costas, útil para postura e força de puxada.',
    muscleGroup: 'COSTAS',
    difficulty: 'INICIANTE',
    instructions: 'Puxe a carga em direção ao abdômen, aproxime as escápulas e retorne com controle.'
  },
  {
    name: 'Puxada frontal',
    description: 'Movimento de puxada vertical para dorsais, bíceps e estabilidade escapular.',
    muscleGroup: 'COSTAS',
    difficulty: 'INICIANTE',
    instructions: 'Leve a barra até a parte superior do peito, mantenha o tronco estável e suba devagar.'
  },
  {
    name: 'Barra fixa',
    description: 'Exercício de peso corporal que fortalece costas, braços e controle do tronco.',
    muscleGroup: 'COSTAS',
    difficulty: 'AVANCADO',
    instructions: 'Inicie com escápulas ativas, puxe o corpo até o queixo passar da barra e desça de forma controlada.'
  },
  {
    name: 'Remada unilateral com halter',
    description: 'Variação unilateral para dorsais e estabilidade lombar.',
    muscleGroup: 'COSTAS',
    difficulty: 'INTERMEDIARIO',
    instructions: 'Apoie uma mão no banco, puxe o halter em direção ao quadril e retorne sem girar o tronco.'
  },
  {
    name: 'Agachamento',
    description: 'Movimento composto para pernas e glúteos, base de programas de força e hipertrofia.',
    muscleGroup: 'PERNAS',
    difficulty: 'INTERMEDIARIO',
    instructions: 'Desça com o peito aberto e joelhos alinhados, atinja amplitude segura e suba empurrando o chão.'
  },
  {
    name: 'Avanço alternado',
    description: 'Exercício unilateral para quadríceps, glúteos e coordenação.',
    muscleGroup: 'PERNAS',
    difficulty: 'INICIANTE',
    instructions: 'Dê um passo à frente, desça até formar ângulos próximos de 90 graus e retorne alternando as pernas.'
  },
  {
    name: 'Leg press',
    description: 'Exercício guiado para desenvolver força em quadríceps e glúteos.',
    muscleGroup: 'PERNAS',
    difficulty: 'INICIANTE',
    instructions: 'Posicione os pés na plataforma, desça sem tirar o quadril do banco e empurre até quase estender os joelhos.'
  },
  {
    name: 'Stiff com halteres',
    description: 'Movimento de cadeia posterior para posteriores de coxa e glúteos.',
    muscleGroup: 'PERNAS',
    difficulty: 'INTERMEDIARIO',
    instructions: 'Desça os halteres próximos às pernas com leve flexão nos joelhos e suba contraindo glúteos.'
  },
  {
    name: 'Desenvolvimento com halteres',
    description: 'Press vertical para deltoides, tríceps e estabilidade do core.',
    muscleGroup: 'OMBROS',
    difficulty: 'INTERMEDIARIO',
    instructions: 'Empurre os halteres acima da cabeça sem arquear a lombar e retorne até a linha dos ombros.'
  },
  {
    name: 'Elevação lateral',
    description: 'Isolamento de deltoide lateral para dar largura aos ombros.',
    muscleGroup: 'OMBROS',
    difficulty: 'INICIANTE',
    instructions: 'Eleve os braços até a linha dos ombros com cotovelos levemente flexionados e desça devagar.'
  },
  {
    name: 'Face pull',
    description: 'Exercício para deltoide posterior e estabilidade escapular, importante para postura.',
    muscleGroup: 'OMBROS',
    difficulty: 'INTERMEDIARIO',
    instructions: 'Puxe a corda em direção ao rosto com cotovelos altos e controle a volta do cabo.'
  },
  {
    name: 'Rosca direta',
    description: 'Movimento clássico para fortalecer bíceps com barra.',
    muscleGroup: 'BICEPS',
    difficulty: 'INICIANTE',
    instructions: 'Mantenha os cotovelos fixos ao lado do corpo, eleve a barra e desça lentamente.'
  },
  {
    name: 'Rosca martelo',
    description: 'Variação para bíceps e braquiorradial com pegada neutra.',
    muscleGroup: 'BICEPS',
    difficulty: 'INICIANTE',
    instructions: 'Suba os halteres com as palmas voltadas uma para a outra e evite balançar o tronco.'
  },
  {
    name: 'Tríceps pulley',
    description: 'Exercício isolado para tríceps com boa estabilidade e controle de carga.',
    muscleGroup: 'TRICEPS',
    difficulty: 'INICIANTE',
    instructions: 'Mantenha os cotovelos junto ao corpo, estenda os braços para baixo e retorne controlando a subida.'
  },
  {
    name: 'Mergulho no banco',
    description: 'Movimento com peso corporal para tríceps e estabilização dos ombros.',
    muscleGroup: 'TRICEPS',
    difficulty: 'INTERMEDIARIO',
    instructions: 'Apoie as mãos no banco, desça o quadril flexionando os cotovelos e suba sem travar os ombros.'
  },
  {
    name: 'Prancha',
    description: 'Exercício isométrico para core, postura e estabilidade da lombar.',
    muscleGroup: 'ABDOMEN',
    difficulty: 'INICIANTE',
    instructions: 'Apoie antebraços e pés no solo, mantenha quadril alinhado e abdômen contraído durante o tempo todo.'
  },
  {
    name: 'Crunch abdominal',
    description: 'Flexão curta do tronco para ativar a região abdominal.',
    muscleGroup: 'ABDOMEN',
    difficulty: 'INICIANTE',
    instructions: 'Eleve levemente o tronco tirando as escápulas do chão sem puxar o pescoço.'
  },
  {
    name: 'Bicicleta no ar',
    description: 'Exercício dinâmico para reto abdominal e oblíquos.',
    muscleGroup: 'ABDOMEN',
    difficulty: 'INTERMEDIARIO',
    instructions: 'Alterne cotovelo e joelho opostos com o abdômen ativo e a lombar estável no solo.'
  }
];
