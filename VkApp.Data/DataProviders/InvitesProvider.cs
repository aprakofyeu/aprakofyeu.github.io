using System;
using System.Collections.Generic;
using NHibernate;
using VkApp.Data.Model;

namespace VkApp.Data.DataProviders
{
    public interface IInvitesProvider
    {
        void MarkAsInvited(int invitedUserId, int userId, int groupId);
        IEnumerable<Invite> GetInvites(int userId, int groupId, DateTime invitationEdge);
    }

    class InvitesProvider: IInvitesProvider
    {
        private readonly ISession _session;

        public InvitesProvider(ISession session)
        {
            _session = session;
        }

        public void MarkAsInvited(int invitedUserId, int userId, int groupId)
        {
            var invite = new Invite
            {
                UserId = userId,
                GroupId = groupId,
                InvitedUserId = invitedUserId,
                Timestamp = DateTime.UtcNow
            };

            _session.SaveOrUpdate(invite);
        }

        public IEnumerable<Invite> GetInvites(int userId, int groupId, DateTime invitationEdge)
        {
            return _session.QueryOver<Invite>()
                .Where(x => x.UserId == userId && x.GroupId == groupId && x.Timestamp >= invitationEdge)
                .List();
        }
    }
}
