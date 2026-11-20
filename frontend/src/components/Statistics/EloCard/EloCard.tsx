import * as S from './EloCard.styles';

interface EloCardProps {
  title: string;
  value: number;
}

function EloCard({ title, value }: EloCardProps) {
  return (
    <S.EloCard>
      <S.EloTitle>{title}</S.EloTitle>
      <S.EloValue>{value}</S.EloValue>
    </S.EloCard>
  );
}

export default EloCard;
