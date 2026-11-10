/* 动态排版：把一行字拆成逐字的小块，进场时依次带倾斜和残影落位（P3R 菜单式的快进—停顿—甩出节奏）。
   读屏软件读的是完整的一句，拆开的字对它隐藏。 */
export default function Kinetic({ text, variant = 'drop', className = 'reveal' }) {
  const chars = Array.from(text);
  return (
    <span className={`${className} kin kin--${variant}`}>
      <span className="visually-hidden">{text}</span>
      <span aria-hidden="true">
        {chars.map((c, i) => (
          <span key={i} className="kin__c" style={{ '--c': i }}>
            {c === ' ' ? ' ' : c}
          </span>
        ))}
      </span>
    </span>
  );
}
