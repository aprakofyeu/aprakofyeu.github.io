--GET COUNTS
SELECT u.FirstName, u.LastName, c.Count FROM ( 
SELECT VkSenderId, COUNT(VkTargetUserId) as Count FROM Messages
GROUP BY VkSenderId) as c
INNER JOIN [User] u
ON c.VkSenderId=u.VkUserId






--SELECT ALL DUPLICATIONS
SELECT u.FirstName, u.LastName, m.VkTargetUserId, m.SentDate FROM [User] u
INNER JOIN Messages m ON u.VkUserId=m.VkSenderId
WHERE m.VkTargetUserId IN(

SELECT VkTargetUserId FROM Messages
GROUP BY VkTargetUserId
Having COUNT (VkTargetUserId)>1)

ORDER BY VkTargetUserId






--SELECT LAST SENT MESSAGE STATISTICS
DECLARE @LastMessage TABLE
(
  VkSenderId int, 
  SentDate date
)

INSERT INTO @LastMessage (VkSenderId, SentDate)
SELECT VkSenderId as VkSenderId, Max(SentDate) as SentDate
FROM Messages
WHERE VkTargetGroupId=1462792
GROUP BY VkSenderId

SELECT u.FirstName, u.LastName, u.VkUserId, lm.SentDate
FROM @LastMessage lm
INNER JOIN [dbo].[User] u ON u.VkUserId=lm.VkSenderId
ORDER BY lm.SentDate DESC