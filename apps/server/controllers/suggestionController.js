exports.getDailySuggestion = async (req, res) => {
  try {
    const response = await fetch('https://zenquotes.io/api/today');
    const data = await response.json();

    const quote = data?.[0]?.q || 'Stay consistent with your healthy habits today.';
    const author = data?.[0]?.a || 'Unknown';

    return res.status(200).json({
      success: true,
      suggestion: `${quote} — ${author}`,
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      suggestion: 'Stay consistent with your healthy habits today.',
    });
  }
};