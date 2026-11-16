import * as S from './StreakCard.styles';

interface StreakCardProps {
  title: string;
  value: string | number;
  description: string;
}

function StreakCard({ title, value, description }: StreakCardProps) {
  return (
    <S.StreakCard>
      <S.Title>{title}</S.Title>
      <S.Value>{value}</S.Value>
      <S.Description>{description}</S.Description>
    </S.StreakCard>
  );
}

export default StreakCard;
