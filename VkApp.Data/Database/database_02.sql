USE [VkAppDb]
GO

ALTER TABLE dbo.[User]
ADD SendInterval int NOT NULL DEFAULT(30),
    SaveLastMessage bit NOT NULL DEFAULT(1)
GO

CREATE TABLE [dbo].[UserSavedMessages](
	[VkUserId] [int] NOT NULL,
	[TargetGroupId] [int] NOT NULL,
	[Message] [nvarchar](max) NOT NULL,
	[Attachments] [nvarchar](max) NULL,
 CONSTRAINT [PK_UserSavedMessages] PRIMARY KEY CLUSTERED 
(
	[VkUserId] ASC,
	[TargetGroupId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO