import { QuestionValidators } from '../types/advanced';

describe('Advanced Question Validators', () => {
  describe('Matching Questions', () => {
    it('should validate matching answers correctly', () => {
      const answer = {
        'pair1-left': 'pair1-right',
        'pair2-left': 'pair2-right'
      };

      const result = QuestionValidators.matching.isValid(answer);
      expect(result).toBe(true);

      const score = QuestionValidators.matching.getScore(answer);
      expect(score).toBe(1);
    });
  });

  describe('Ordering Questions', () => {
    it('should validate ordering answers correctly', () => {
      const answer = ['item1', 'item2', 'item3'];

      const result = QuestionValidators.ordering.isValid(answer);
      expect(result).toBe(true);

      const score = QuestionValidators.ordering.getScore(answer);
      expect(score).toBe(1);
    });
  });

  describe('Multi-Select Questions', () => {
    it('should validate multi-select answers correctly', () => {
      const answer = ['option1', 'option3'];

      const result = QuestionValidators.multi_select.isValid(answer);
      expect(result).toBe(true);

      const score = QuestionValidators.multi_select.getScore(answer);
      expect(score).toBe(1);
    });
  });
}); 