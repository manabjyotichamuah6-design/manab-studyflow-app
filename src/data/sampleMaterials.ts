export interface SampleTopic {
  id: string;
  title: string;
  category: string;
  estimatedReadTime: string;
  notes: string;
}

export const SAMPLE_TOPICS: SampleTopic[] = [
  {
    id: 'sample-biology',
    title: 'Photosynthesis & Cellular Energy Flow',
    category: 'Biology',
    estimatedReadTime: '3 min read',
    notes: `Photosynthesis is the biological process by which autotrophic organisms—primarily green plants, algae, and cyanobacteria—convert light energy into chemical energy stored in glucose molecules.

The overall chemical equation is:
6CO2 + 6H2O + Light Energy -> C6H12O6 + 6O2

Photosynthesis occurs in two distinct, coordinated phases within the chloroplast:
1. Light-Dependent Reactions (Thylakoid Membrane):
Chlorophyll pigments absorb photons, exciting electrons in Photosystem II (PSII) and Photosystem I (PSI). Water molecules are split through photolysis, releasing O2 as a byproduct, protons (H+) into the lumen, and electrons to replenish PSII. The resulting proton gradient across the thylakoid membrane powers ATP Synthase to generate ATP (photophosphorylation), while NADP+ is reduced to NADPH.

2. Light-Independent Reactions / Calvin Cycle (Stroma):
Using ATP and NADPH from the light reactions, the enzyme RuBisCO catalyzes carbon fixation by attaching CO2 to Ribulose-1,5-bisphosphate (RuBP). The 3-carbon intermediates (3-PGA) are reduced to Glyceraldehyde 3-phosphate (G3P). For every six turns of the cycle, two G3P molecules exit to synthesize one glucose molecule, while the remaining G3P molecules regenerate RuBP.

Limiting factors include light intensity, carbon dioxide concentration, and ambient temperature (which affects RuBisCO enzymatic reaction rates). Cellular respiration in mitochondria operates as the complementary catabolic process, breaking down glucose through glycolysis, the Krebs cycle, and oxidative phosphorylation to regenerate ATP.`,
  },
  {
    id: 'sample-cs',
    title: 'Machine Learning: Gradient Descent & Loss Functions',
    category: 'Computer Science',
    estimatedReadTime: '4 min read',
    notes: `Gradient Descent is a first-order iterative optimization algorithm used in machine learning and deep learning to find the local minimum of a differentiable cost or loss function.

Core Mechanism:
Given a model with parameters (weights W and biases b) and an objective loss function L(W), gradient descent updates parameters in the direction of the steepest descent—namely the negative gradient of the loss with respect to parameters:
W_new = W_old - learning_rate * (dL / dW)

Key Concepts:
1. Loss Function:
Quantifies model prediction error compared to ground truth. Common loss functions include Mean Squared Error (MSE) for regression tasks and Cross-Entropy Loss for categorical classification.

2. Learning Rate (alpha):
A hyperparameter determining step size at each iteration.
- If alpha is too small: Convergence is exceptionally slow, risking getting stuck in plateaus.
- If alpha is too large: The algorithm may overshoot the minimum and diverge completely.

3. Variants of Gradient Descent:
- Batch Gradient Descent: Computes the gradient using the entire training dataset per update. Accurate but computationally prohibitive for large datasets.
- Stochastic Gradient Descent (SGD): Updates parameters per individual training sample. Fast with noise that helps escape local minima, but shows high variance in loss trajectory.
- Mini-Batch Gradient Descent: The standard industry compromise, calculating gradients over batches of size 32, 64, or 128.

4. Momentum & Modern Optimizers:
Adam (Adaptive Moment Estimation) combines momentum (moving average of past gradients) and RMSProp (scaling learning rates inversely with variance of gradients) to achieve faster, more stable convergence across complex loss landscapes.`,
  },
  {
    id: 'sample-econ',
    title: 'Macroeconomics: Inflation, Interest Rates & Monetary Policy',
    category: 'Economics',
    estimatedReadTime: '3 min read',
    notes: `Inflation represents the sustained, generalized increase in the overall price level of goods and services within an economy over a specific time period, resulting in the erosion of purchasing power.

Types and Drivers of Inflation:
1. Demand-Pull Inflation:
Occurs when aggregate demand for goods and services outpaces aggregate supply in an expanding economy ("too much money chasing too few goods").
2. Cost-Push Inflation:
Occurs when aggregate supply decreases due to higher production input costs (such as surges in crude oil prices, raw materials, or supply chain bottlenecks), pushing consumer prices higher.
3. Built-In / Wage-Price Spiral:
Workers demand higher wages to keep up with living costs, causing businesses to raise prices to cover wage costs, creating a self-reinforcing inflationary loop.

Central Bank Monetary Policy Response:
Central banks (e.g., the Federal Reserve or European Central Bank) use interest rates as their primary policy lever.
- Contractionary Monetary Policy:
When inflation rises above target (typically ~2%), the central bank raises the benchmark policy interest rate. Higher borrowing rates increase costs for mortgages, business loans, and consumer credit, which dampens consumption and capital expenditure, thereby cooling aggregate demand and slowing price growth.
- Expansionary Policy:
During economic recessions with low inflation, central banks cut rates to stimulate investment and spending.

Trade-offs & The Phillips Curve:
Historically, the short-run Phillips Curve suggested an inverse relationship between inflation and unemployment. However, episodes of stagflation (high inflation combined with stagnant growth and elevated unemployment) demonstrate that supply shocks can decouple this relationship.`,
  },
  {
    id: 'sample-history',
    title: 'The French Revolution: Causes & Turning Points (1789-1799)',
    category: 'History',
    estimatedReadTime: '4 min read',
    notes: `The French Revolution (1789–1799) was a transformative period of social, ideological, and political upheaval that dismantled the Ancien Régime in France and reshaped modern democratic concepts across Europe.

Key Causes:
1. Social Inequality (The Three Estates):
French society was divided into the First Estate (Clergy), Second Estate (Nobility), and Third Estate (Commoners, peasants, and the rising bourgeoisie making up ~98% of the population). The Third Estate bore almost the entire tax burden while possessing negligible political representation.
2. Financial Crisis:
Heavy debt accumulated from foreign wars (including support for the American Revolutionary War) and royal expenditures brought the French monarchy to near bankruptcy.
3. Enlightenment Ideals:
Philosophers like Rousseau, Voltaire, and Montesquieu challenged absolute monarchy and promoted popular sovereignty, liberty, and the separation of powers.
4. Agrarian Crisis:
Severe crop failures in 1788-1789 caused soaring bread prices, widespread starvation, and peasant unrest.

Key Turning Points:
- May 1789: Meeting of the Estates-General and the formation of the National Assembly after the Tennis Court Oath.
- July 14, 1789: Storming of the Bastille, symbolizing the overthrow of tyrannical rule.
- August 1789: Declaration of the Rights of Man and of the Citizen, proclaiming universal equality and liberty before the law.
- 1793-1794: The Reign of Terror led by Maximilien Robespierre and the Committee of Public Safety, executing thousands of perceived counter-revolutionaries.
- 1799: Napoleon Bonaparte's coup d'état of 18 Brumaire, ending the revolutionary republic and establishing the Consulate.`,
  },
];
